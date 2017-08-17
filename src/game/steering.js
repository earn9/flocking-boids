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

export { SEEK_STEERING, FLEE_STEERING, seek, flee };