import { Vector3 } from 'three';

const createSeeker = (position, direction, speed, tag) => {
    const seeker = { position, diretion, speed, tag };

    seeker.update = () => {};

    return seeker;
};

export { createSeeker };