import { Vector3 } from 'three';

const createBoid = (position, direction, speed, tag) => {
    const boid = { 
        position, 
        direction, 
        speed, 
        maxSpeed: 2,
        maxForce: 0.2,
        tag,
        mass: 1,
        friends: []
    };

    const getVectorToFriend = (me, other) => {
        const result = me.clone();
        result.sub(other);
        result.normalize();
        return result;
    };

    const rotationVector = new Vector3(0, 1, 0);

    const integrate = (steeringDirection, delta) => {
        const steeringForce = steeringDirection.clone();
        steeringForce.clampLength(0, boid.maxForce * delta);
        const acceleration = steeringForce.clone();
        acceleration.divideScalar(boid.mass);

        const velocity = boid.direction.clone();
        velocity.multiplyScalar(boid.speed * delta);
        velocity.add(acceleration);
        velocity.clampLength(0, boid.maxSpeed * delta);

        boid.position.add(velocity);

        boid.speed = velocity.length() / delta;
        velocity.normalize();
        boid.direction.copy(velocity);
    };

    const findLocalAveragePoint = () => {
        const averagePosition = new Vector3(0, 0, 0);
        for (const friend of boid.friends) {
            averagePosition.add(friend.position)
        }        
        averagePosition.divideScalar(boid.friends.length);
        return averagePosition;
    };

    const getForceTowardCenterOfFriends = () => {
        const localCenter = findLocalAveragePoint();
        if (boid.friends.length > 0) {
            localCenter.sub(boid.position);
            localCenter.divideScalar(100);
        }
        return localCenter
    }

    const getForceAwayFromNearby = () => {
        const result = new Vector3(0, 0, 0);
        for (const friend of boid.friends) {
            const difference = friend.position.clone();
            difference.sub(boid.position);
            result.sub(difference);
        }
        result.divideScalar(250);
        return result;
    };

    boid.update = (delta, world) => {
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

        const forceToCenter = getForceTowardCenterOfFriends();
        const forceAway = getForceAwayFromNearby(); 

        const totalSteeringForce = new Vector3(0, 0, 0);
        totalSteeringForce.add(forceToCenter);
        totalSteeringForce.add(forceAway);

        integrate(totalSteeringForce, delta);
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

const createBoidWithRandomPositionAndDirection = (min, max, speed, tag) => {
    const { x: xPos, y: yPos } = randomVec2(-5, 5);
    const position = new Vector3(xPos, 0, yPos);

    const { x: xDir, y: yDir } = randomDirection();
    const direction = new Vector3(xDir, 0, yDir);

    return createBoid(position, direction, speed, tag);
};


const createWorld = () => {
    const boids = {};
    const world = {};

    world.addBoid = (boid) => {
        boids[boid.tag] = boid;
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