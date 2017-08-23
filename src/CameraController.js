const OutFov = 75;
const InFov = 15;

class StateBase {
    constructor(cameraController) {
        this.cameraController = cameraController;
    }

    update() { }
    zoom() { }
}

class ZoomedInState extends StateBase {
    constructor(cameraController) {
        super(cameraController);
    }

    zoom() {
        this.cameraController.setState(new OutState(this.cameraController));        
    }
}

class ZoomedOutState extends StateBase {
    constructor(cameraController) {
        super(cameraController);
    }

    zoom() {
        this.cameraController.setState(new InState(this.cameraController));        
    }
}

class InState extends StateBase {
    constructor(cameraController) {
        super(cameraController);
    }

    update() {
        this.cameraController.setFov(InFov);
        this.cameraController.setMovementFactor(this.cameraController.InMovement);
        this.cameraController.setState(new ZoomedInState(this.cameraController));
    }
}

class OutState extends StateBase {
    constructor(cameraController) {
        super(cameraController);
    }

    update() {
        this.cameraController.setFov(OutFov);
        this.cameraController.setMovementFactor(this.cameraController.OutMovement);
        this.cameraController.setState(new ZoomedOutState(this.cameraController));
    }    
}

export default class CameraController  {
    constructor(camera) {
        this.camera = camera;
        this.currentState = new ZoomedOutState(this);
    }

    setPointerLockControls(pointerLockControls) {
        this.pointerLockControls = pointerLockControls;
        this.OutMovement = pointerLockControls.movementFactor;
        this.InMovement = pointerLockControls.movementFactor / 8;
    }

    setFov(fov) {
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
    }

    setMovementFactor(factor) {
        this.pointerLockControls.movementFactor = factor;
    }

    setState(state) {
        this.currentState = state;
    }

    update() {
        this.currentState.update();
    }

    zoom() {
        this.currentState.zoom();
    }
}