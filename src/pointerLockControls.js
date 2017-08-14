import * as THREE from 'three';

/**
 * @author mrdoob / http://mrdoob.com/
 */

const PointerLockControls = function (camera) {

    var scope = this;

    camera.rotation.set(0, 0, 0);

    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 10;
    yawObject.add(pitchObject);

    var PI_2 = Math.PI / 2;

    var onMouseMove = function (event) {

        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * scope.movementFactor;
        pitchObject.rotation.x -= movementY * scope.movementFactor;

        pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, pitchObject.rotation.x));

    };

    this.dispose = function () {

        document.removeEventListener('mousemove', onMouseMove, false);

    };

    document.addEventListener('mousemove', onMouseMove, false);

    this.enabled = false;
    this.movementFactor = 0.002;

    this.getObject = function () {

        return yawObject;

    };

    this.getDirection = function () {

        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3(0, 0, - 1);
        var rotation = new THREE.Euler(0, 0, 0, 'YXZ');

        return function (v) {

            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;

        };

    }();

    this.setPosition = function(x, y, z) {
        yawObject.position.setX(x);
        yawObject.position.setY(y);
        yawObject.position.setZ(z);
    };
};


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
        pointerLockChange(document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element);
        };
    document.addEventListener('pointerlockchange', changed, false);
    document.addEventListener('mozpointerlockchange', changed, false);
    document.addEventListener('webkitpointerlockchange', changed, false);
};

export default PointerLockControls;
export { pointerLockSupported, lockPointer, onPointerLockChanged };
