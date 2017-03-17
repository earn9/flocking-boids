import { Vector3 } from 'three';

const createSeeker = (position, direction, speed, tag) => {
    const seeker = { 
        position, 
        direction, 
        speed, 
        tag,
        friends: [] 
    };

    seeker.update = () => {};

    return seeker;
};

export { createSeeker };