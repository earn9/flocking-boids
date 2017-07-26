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

export { World };