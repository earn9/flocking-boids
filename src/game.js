import * as THREE from 'three';

const createBoid = (position, direction, speed) => {
    const findClosestFriend = (fromBoid, world) => {
        let friend;
        let distance = 9999999999;
        world.forEachBoid(otherBoid => {
            if (fromBoid === otherBoid) return;
            const newDist = fromBoid.position.distanceTo(otherBoid.position);
            if (newDist < distance) {
                friend = otherBoid;
                distance = newDist
            }
        });
        return distance < 1 ? friend : undefined;
    };

    const getVectorToFriend = (me, other) => {
        const result = me.clone();
        result.sub(other);
        result.normalize();
        return result;
    }

    const rotationVector = new THREE.Vector3(0, 1, 0);

    const boid = {
        position,
        direction,
        speed
    };

    boid.update = (delta, world) => {
        const velocity = boid.direction.clone();
        velocity.multiplyScalar(boid.speed);
        velocity.multiplyScalar(delta);
        boid.position.add(velocity);

        boid.friend = findClosestFriend(boid, world);

        if (boid.friend) {
            const vecToFriend = getVectorToFriend(boid.position, boid.friend.position);
            const rot = vecToFriend.dot(boid.direction);
            console.log('angleTo', rot);
            const rotConst = 8;
            const rotFactor = rot > 0 ? 1 * rotConst : -1 * rotConst;
            boid.direction.applyAxisAngle(rotationVector, (rotFactor * delta));
        }
    };

    return boid;
};

const createWorld = () => {
    const boids = {};
    const world = {};

    world.addBoid = (position, direction, speed, key) => {
        boids[key] = createBoid(position, direction, speed);
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

    return world;
};

export { createBoid, createWorld };