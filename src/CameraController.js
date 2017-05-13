const ZoomState = {
    None: 'none',
    In: 'in',
    Out: 'out'
};

export default class CameraController  {
    constructor(camera) {
        this.camera = camera;
        this.currentState = ZoomState.None;

        this.OutFov = 75;
        this.InFov = 15;
    }

    update(delta) {
        switch (this.currentState) {
            case ZoomState.None:
                return;
            case ZoomState.In:
                if (this.camera.fov === this.InFov) return;
                console.log('zooming in');
                this.camera.fov = this.InFov;
                this.camera.updateProjectionMatrix();
                return;
            case ZoomState.Out:
                if (this.camera.fov === this.OutFov) return;
                console.log('zooming out');
                this.camera.fov = this.OutFov;
                this.camera.updateProjectionMatrix();
                return;
        }

    }

    zoomIn() {
        this.currentState = ZoomState.In;
    }

    zoomOut() {
        this.currentState = ZoomState.Out;
    }
}