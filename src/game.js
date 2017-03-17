import { Vector3 } from 'three';

const createBoid = (position, direction, speed) => {
    const boid = {
        position,
        direction,
        speed,
        friends: []
    };

    const getVectorToFriend = (me, other) => {
        const result = me.clone();
        result.sub(other);
        result.normalize();
        return result;
    };

    const rotationVector = new Vector3(0, 1, 0);

    const findLocalAveragePoint = () => {
        const averagePosition = boid.position.clone();
        for (const friend of boid.friends) {
            averagePosition.add(friend.position)
        }        
        averagePosition.divideScalar(boid.friends.length + 1);
        return averagePosition;
    };

    boid.update = (delta, world) => {
        const velocity = boid.direction.clone();
        velocity.multiplyScalar(boid.speed);
        velocity.multiplyScalar(delta);
        boid.position.add(velocity);

        boid.friends = world.findNearbyBoids(boid, 1);

        const averageNeighbourDirection = new Vector3();
        for (const friend of boid.friends) {
            averageNeighbourDirection.add(friend.direction);            
        }
        if (boid.friends.length > 0) {
            averageNeighbourDirection.divideScalar(boid.friends.length);
            const localCenter = findLocalAveragePoint();
            const distanceToCenter = boid.position.distanceTo(localCenter);
        }
    };

    return boid;
};

const randomBetween = (min, max) => {
    return Math.random() * (max - min) + min;
};

const randomVec2 = (min, max) => {
    return {
        x: randomBetween(min, max),
        y: randomBetween(min, max)
    };
};

const randomDirection = () => {
    const factor = 2 * Math.PI * Math.random();

    return {
        x: Math.cos(factor),
        y: Math.sin(factor)
    };
};

const createBoidWithRandomPositionAndDirection = (min, max, speed) => {
    const { x: xPos, y: yPos } = randomVec2(-5, 5);
    const position = new Vector3(xPos, 0, yPos);

    const { x: xDir, y: yDir } = randomDirection();
    const direction = new Vector3(xDir, 0, yDir);

    return createBoid(position, direction, speed);
};


const createWorld = () => {
    const boids = {};
    const world = {};

    world.addBoid = (boid, key) => {
        boids[key] = boid;
    };

    world.update = (delta) => {
        for (const key in boids) {
            boids[key].update(delta, world);
        };
    };

    world.forEachBoid = (boidAction) => {
        for (const key in boids) {
            boidAction(boids[key]);
        };
    }

    world.getBoid = (key) => {
        return boids[key];
    };

    world.findNearbyBoids = (fromBoid, cutoffDistance) => {
        let friends = [];
        world.forEachBoid(otherBoid => {
            if (fromBoid === otherBoid) return;
            const newDist = fromBoid.position.distanceTo(otherBoid.position);
            if (newDist < cutoffDistance) {
                friends.push(otherBoid);
            }
        });
        return friends;
    };


    return world;
};

export { createBoid, createWorld, createBoidWithRandomPositionAndDirection };