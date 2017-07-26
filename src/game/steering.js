const SEEK_STEERING = 'seek';
const FLEE_STEERING = 'flee';

const seek = (currentPosition, targetPosition, speed, delta) => {
    const desiredVelocity = targetPosition.clone();
    desiredVelocity.sub(currentPosition);
    desiredVelocity.normalize();
    desiredVelocity.multiplyScalar(speed * delta);
    return desiredVelocity;
};

const flee = (currentPosition, targetPosition, speed, delta) => {
    const desiredVelocity = currentPosition.clone();
    desiredVelocity.sub(targetPosition);
    desiredVelocity.normalize();
    desiredVelocity.multiplyScalar(speed * delta);
    return desiredVelocity;
};

const strategies = {
    [SEEK_STEERING]: seek,
    [FLEE_STEERING]: flee
};

const createVehicle = (position, direction, speed, target, tag, strategy = SEEK_STEERING) => {
    const vehicle = { 
        position, 
        direction, 
        speed, 
        maxSpeed: 5,
        maxForce: 0.2,
        target,
        tag,
        mass: 1,
        strategy,
        friends: []
    };

    const integrate = (steeringDirection, delta) => {
        const steeringForce = steeringDirection.clone();
        steeringForce.clampLength(0, vehicle.maxForce * delta);
        const acceleration = steeringForce.clone();
        acceleration.divideScalar(vehicle.mass);

        const velocity = vehicle.direction.clone();
        velocity.multiplyScalar(vehicle.speed * delta);
        velocity.add(acceleration);
        velocity.clampLength(0, vehicle.maxSpeed * delta);

        vehicle.position.add(velocity);

        vehicle.speed = velocity.length() / delta;
        velocity.normalize();
        vehicle.direction.copy(velocity);
    };

    vehicle.update = (delta) => {
        const desiredVelocity = strategies[vehicle.strategy](vehicle.position, vehicle.target, vehicle.maxSpeed, delta);

        const steering = desiredVelocity.clone();
        //console.log("steering: " + JSON.stringify(steering));
        const velocity = vehicle.direction.clone();
        velocity.multiplyScalar(vehicle.speed * delta);
        steering.sub(velocity);

        integrate(steering, delta);

        //console.log("position: " + JSON.stringify(vehicle.position));
        //console.log("direction: " + JSON.stringify(vehicle.direction));
        //console.log("speed: " + JSON.stringify(vehicle.speed));
    };

    return vehicle;
};

export { createVehicle, SEEK_STEERING, FLEE_STEERING, seek };