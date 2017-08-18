class World {
    constructor() {
        this.boids = [];
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

    addBoid(boid) {
        this.boids.push(boid);
    }

    update(delta) {
        for (const controller of Object.values(this.controllers)) {
            controller.update(delta);
        }
        for (const boid of this.boids) {
            boid.update(delta, this);
        }
    }

    getBoid(key) {
        return this.boids[key];
    }

    findNearbyBoids(fromBoid, cutoffDistance) {
        const friends = [];
        this.boids.forEach(otherBoid => {
            if (fromBoid === otherBoid) return;
            const newDist = fromBoid.position.distanceTo(otherBoid.position);
            if (newDist < cutoffDistance) {
                friends.push(otherBoid);
            }
        });
        return friends;
    }
}

export { World };