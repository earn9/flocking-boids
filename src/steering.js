import { Vector3 } from 'three';

const createSeeker = (position, direction, speed, target, tag) => {
    const seeker = { 
        position, 
        direction, 
        speed, 
        maxForce: 10,
        target,
        tag,
        mass: 10,
        friends: []
    };

    const integrate = (steeringDirection, delta) => {
        const steeringForce = steeringDirection.clone();
        steeringForce.clampLength(0, seeker.maxForce);
        const acceleration = steeringForce.clone();
        acceleration.divideScalar(seeker.mass);

        const velocity = seeker.direction.clone();
        velocity.multiplyScalar(seeker.speed);
        velocity.add(acceleration);
        velocity.clampLength(0, seeker.speed * delta);

        seeker.direction.copy
        seeker.position.add(velocity);

        velocity.normalize();
        seeker.direction.copy(velocity);
    };

    seeker.update = (delta) => {
        const desiredVelocity = seeker.target.clone();
        desiredVelocity.sub(seeker.position);
        desiredVelocity.normalize();
        desiredVelocity.multiplyScalar(seeker.speed);

        const steering = desiredVelocity.clone();

        const velocity = seeker.direction.clone();
        velocity.multiplyScalar(seeker.speed * delta);
        steering.add(velocity);

        integrate(steering, delta);
    };

    return seeker;
};

export { createSeeker };