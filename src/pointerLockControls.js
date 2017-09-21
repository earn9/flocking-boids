import * as THREE from 'three';

/**
 * @author mrdoob / http://mrdoob.com/
 */

const PI_2 = Math.PI / 2;


class PointerLockControls {
    constructor(camera) {
        camera.rotation.set(0, 0, 0);

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);

        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 10;
        this.yawObject.add(this.pitchObject);

        this.mouseMoveHander = (event) => this.onMouseMove(event);
        document.addEventListener('mousemove', (event) => this.onMouseMove(event), false);

        this.enabled = false;
        this.movementFactor = 0.002;

        this.direction = new THREE.Vector3(0, 0, - 1);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');

    }

    onMouseMove(event) {

        if (this.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.yawObject.rotation.y -= movementX * this.movementFactor;
        this.pitchObject.rotation.x -= movementY * this.movementFactor;

        this.pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, this.pitchObject.rotation.x));

    }

    dispose() {
        document.removeEventListener('mousemove', this.mouseMoveHander, false);
    }

    getDirection(v) {
        this.rotation.set(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);
        v.copy(this.direction).applyEuler(this.rotation);
        return v;
    }

    getObject() {
        return this.yawObject;
    }

    setPosition(x, y, z) {
        this.yawObject.position.setX(x);
        this.yawObject.position.setY(y);
        this.yawObject.position.setZ(z);
    }
}

const pointerLockSupported = () => {
    return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
};

const lockPointer = (element) => {
    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();
};

const onPointerLockChanged = (document, pointerLockChange) => {
    const element = document.body;
    const changed = () => {
        pointerLockChange(
            document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element);
    };
    document.addEventListener('pointerlockchange', changed, false);
    document.addEventListener('mozpointerlockchange', changed, false);
    document.addEventListener('webkitpointerlockchange', changed, false);
};

export default PointerLockControls;
export { pointerLockSupported, lockPointer, onPointerLockChanged };
