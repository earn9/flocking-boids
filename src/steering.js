import { Vector3 } from 'three';

const createSeeker = (position, direction, speed, target, tag) => {
    const seeker = { 
        position, 
        direction, 
        speed, 
        target,
        tag,
        friends: [] 
    };

    seeker.update = (delta) => {
        
    };

    return seeker;
};

export { createSeeker };