import { Vector3 } from 'three';
import { randomDirection, randomVec2 } from './mathUtils';

const friendDistance = 1;

class Boid {

    constructor(position, direction, speed, tag) {
        this.position = position;
        this.direction = direction;
        this.speed = speed;
        this.tag = tag;
        this.maxSpeed = 1.5;
        this.minSpeed = 0.4;
        this.maxForce = 0.2;
        this.mass = 1;
        this.friends = [];
    }

    integrate(steeringDirection, delta) {
        const steeringForce = steeringDirection.clone();
        steeringForce.clampLength(0, this.maxForce * delta);
        const acceleration = steeringForce.clone();
        acceleration.divideScalar(this.mass);

        const velocity = this.direction.clone();
        velocity.multiplyScalar(this.speed * delta);
        velocity.add(acceleration);
        velocity.clampLength(this.minSpeed * delta, this.maxSpeed * delta);

        this.position.add(velocity);

        this.speed = velocity.length() / delta;
        velocity.normalize();
        this.direction.copy(velocity);      
    }

    findLocalAveragePoint() {
        const averagePosition = new Vector3(0, 0, 0);
        for (const friend of this.friends) {
            averagePosition.add(friend.position);
        }        
        averagePosition.divideScalar(this.friends.length);
        return averagePosition;
    }

    getForceTowardCenterOfFriends() {
        const localCenter = this.findLocalAveragePoint();
        if (this.friends.length > 0) {
            localCenter.sub(this.position);
            localCenter.divideScalar(100);
        }
        return localCenter;
    }

    getForceAwayFromNearby() {
        const result = new Vector3(0, 0, 0);
        for (const friend of this.friends) {
            const vectorFromFriendToBoid = friend.position.clone();
            vectorFromFriendToBoid.sub(this.position);
            const lengthFromFriendToBoid = vectorFromFriendToBoid.length();
            const inverseOfLengthFromFriendToBoid = friendDistance - lengthFromFriendToBoid;
            const forceLength = inverseOfLengthFromFriendToBoid * -0.7;
            vectorFromFriendToBoid.setLength(forceLength);

            result.add(vectorFromFriendToBoid);
        }
        result.divideScalar(150);
        return result;
    }

    getForceToMatchVelocity() {
        const result = new Vector3(0, 0, 0);

        if (this.friends.length === 0) {
            return result;
        }

        for (const friend of this.friends) {
            result.add(friend.getVelocity());
        }
        result.divideScalar(this.friends.length);

        result.sub(this.getVelocity());
        result.divideScalar(320);
        return result;
    }

    getVelocity() {
        const velocity = this.direction.clone();
        velocity.multiplyScalar(this.speed);
        return velocity;
    }

    update(delta, world) {
        this.friends = world.findNearbyBoids(this, friendDistance);

        this.forceToCenter = this.getForceTowardCenterOfFriends();
        this.forceAway = this.getForceAwayFromNearby(); 
        this.forceToMatchVelocity = this.getForceToMatchVelocity();

        const totalSteeringForce = new Vector3(0, 0, 0);
        totalSteeringForce.add(this.forceToCenter);
        totalSteeringForce.add(this.forceAway);
        totalSteeringForce.add(this.forceToMatchVelocity);

        this.integrate(totalSteeringForce, delta);
    } 
}

class World {
    constructor() {
        this.boids = {};
        this.controllers = {};
        this.nextControllerName = 0;        
    }

    addController(controller, name) {
        if (!name) {
            this.nextControllerName += 1;
            name = this.nextControllerName;
        }
        this.controllers[name] = controller;
    }

    getControllerByName (name) {
        return this.controllers[name];
    }

    addBoid(boid) {
        this.boids[boid.tag] = boid;
    }

    update(delta) {
        for (const controller of Object.values(this.controllers)) {
            controller.update(delta);
        }
        for (const key in this.boids) {
            this.boids[key].update(delta, this);
        }
    }

    forEachBoid(boidAction) {
        for (var boid of Object.values(this.boids)) {
            boidAction(boid);
        }
    }

    getBoid(key) {
        return this.boids[key];
    }

    findNearbyBoids(fromBoid, cutoffDistance) {
        const friends = [];
        this.forEachBoid(otherBoid => {
            if (fromBoid === otherBoid) return;
            const newDist = fromBoid.position.distanceTo(otherBoid.position);
            if (newDist < cutoffDistance) {
                friends.push(otherBoid);
            }
        });
        return friends;
    }

}

const createBoidWithRandomPositionAndDirection = (min, max, speed, tag) => {
    const { x: xPos, y: yPos } = randomVec2(min, max);
    const position = new Vector3(xPos, 10, yPos);

    const { x: xDir, y: yDir } = randomDirection();
    const direction = new Vector3(xDir, 0, yDir);

    return new Boid(position, direction, speed, tag);
};

const createWorld = () => {
    return new World();
};

export { createWorld, createBoidWithRandomPositionAndDirection };