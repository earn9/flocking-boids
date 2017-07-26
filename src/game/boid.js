import { Vector3 } from 'three';

import { randomDirection, randomVec2 } from '../mathUtils';
import { seek } from './steering';

const friendDistance = 1;
const yOffset = 10;
const flockingCenter = new Vector3(0, yOffset, 0);


const BoidStates = {
    flocking: 'flocking',
    returning: 'returning'
};

const maxDistance = 50;
const startFlockingAgainDistance = 45;


class Boid {

    constructor(position, direction, speed, tag) {
        this.position = position;
        this.direction = direction;
        this.speed = speed;
        this.tag = tag;
        this.maxSpeed = 1.5;
        this.minSpeed = 0.7;
        this.maxForce = 0.1;
        this.mass = 1;
        this.friends = [];
        this.maxDistanceFromCenter = 10;
        this.state = BoidStates.flocking;
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

    selectState() {
        const distanceToFlockingCenter = this.position.distanceTo(flockingCenter);
        if (distanceToFlockingCenter > maxDistance && this.state === BoidStates.flocking) {
            return BoidStates.returning;
        } 
        
        if (distanceToFlockingCenter < startFlockingAgainDistance && this.state === BoidStates.returning) {
            return BoidStates.flocking;
        }

        return this.state;        
    }

    update(delta, world) {
        this.friends = world.findNearbyBoids(this, friendDistance);

        this.state = this.selectState();

        const totalSteeringForce = new Vector3();
        switch (this.state) {
            case BoidStates.flocking:
                this.forceToCenter = this.getForceTowardCenterOfFriends();
                this.forceAway = this.getForceAwayFromNearby(); 
                this.forceToMatchVelocity = this.getForceToMatchVelocity();
                totalSteeringForce.add(this.forceToCenter);
                totalSteeringForce.add(this.forceAway);
                totalSteeringForce.add(this.forceToMatchVelocity);
                break;
            case BoidStates.returning:
                this.forceAway = this.getForceAwayFromNearby(); 
                totalSteeringForce.add(this.forceAway);
                totalSteeringForce.add(seek(this.position, flockingCenter, this.speed, delta));
                break;
        }

        this.integrate(totalSteeringForce, delta);
    } 

    static createWithRandomPositionAndDirection(min, max, speed, tag) {
        const { x: xPos, y: yPos } = randomVec2(min, max);
        const position = new Vector3(xPos, yOffset, yPos);

        const { x: xDir, y: yDir } = randomDirection();
        const direction = new Vector3(xDir, 0, yDir);

        return new Boid(position, direction, speed, tag);
    }
}

export { Boid };