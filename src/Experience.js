
export default class Experience {
    constructor(scene, camera, view, world = null) {
        this.scene = scene;
        this.camera = camera;
        this.view = view;
        this.world = world;
    }

    update(delta, context) {
        if (this.world) {
            this.world.update(delta);
        }
        if (this.view) {
            this.view.update(context, delta);
        }
    }

    pageResized(page) {
        this.camera.aspect = page.getAspectRatio();
        this.camera.updateProjectionMatrix();
    }

    renderUsing(renderer) {
        renderer.render(this.scene, this.camera);
    }
}