import { Vector3 } from 'three';

const createSeeker = (position, direction, speed, target, tag) => {
    const seeker = { 
        position, 
        direction, 
        speed, 
        maxSpeed: 5,
        maxForce: 0.2,
        target,
        tag,
        mass: 1,
        friends: []
    };

    const integrate = (steeringDirection, delta) => {
        const steeringForce = steeringDirection.clone();
        steeringForce.clampLength(0, seeker.maxForce * delta);
        const acceleration = steeringForce.clone();
        acceleration.divideScalar(seeker.mass);

        const velocity = seeker.direction.clone();
        velocity.multiplyScalar(seeker.speed * delta);
        velocity.add(acceleration);
        velocity.clampLength(0, seeker.maxSpeed * delta);

        seeker.direction.copy
        seeker.position.add(velocity);

        seeker.speed = velocity.length() / delta;
        velocity.normalize();
        seeker.direction.copy(velocity);
    };

    seeker.update = (delta) => {
        const desiredVelocity = seeker.target.clone();
        desiredVelocity.sub(seeker.position);
        desiredVelocity.normalize();
        desiredVelocity.multiplyScalar(seeker.maxSpeed * delta);

        const steering = desiredVelocity.clone();
        console.log("steering: " + JSON.stringify(steering));
        const velocity = seeker.direction.clone();
        velocity.multiplyScalar(seeker.speed * delta);
        steering.sub(velocity);

        integrate(steering, delta);

        console.log("position: " + JSON.stringify(seeker.position));
        console.log("direction: " + JSON.stringify(seeker.direction));
        console.log("speed: " + JSON.stringify(seeker.speed));
    };

    return seeker;
};

export { createSeeker };