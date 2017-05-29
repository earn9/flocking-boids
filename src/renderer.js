import * as THREE from 'three';
import { randomBetween } from './mathUtils';

const center = new THREE.Vector3(0, 0, 0);
const xAxisNormal = new THREE.Vector3(1, 0, 0);
const yAxisNormal = new THREE.Vector3(0, 1, 0);
const zAxisNormal = new THREE.Vector3(0, 0, 1);

const xAxisHalfNormal = new THREE.Vector3(0.5, 0, 0);
const yAxisHalfNormal = new THREE.Vector3(0, 0.5, 0);
const zAxisHalfNormal = new THREE.Vector3(0, 0, 0.5);

const createAxisGroup = () => {
    const group = new THREE.Group();
    const xAxisLine = createDebugLine(group, 0xff0000);
    xAxisLine.setLine(center, xAxisHalfNormal);
    const yAxisLine = createDebugLine(group, 0x00ff00);
    yAxisLine.setLine(center, yAxisHalfNormal);
    const zAxisLine = createDebugLine(group, 0x0000ff);
    zAxisLine.setLine(center, zAxisHalfNormal);
    return group;
};

const getRotationMatrix = (direction) => {
    const zAxis = direction.clone();
    const yAxis = yAxisNormal.clone();
    const xAxis = yAxis.clone();
    xAxis.cross(zAxis);
    xAxis.normalize();
    const rotationMatrix = new THREE.Matrix4();
    rotationMatrix.makeBasis(xAxis, yAxis, zAxis);
    return rotationMatrix;
};

const createFriendLines = (scene) => {
    const lineColor = Math.random() * 0xffffff;
    const friendLines = [];
    for (let i = 0; i < 10; i++) {
        friendLines[i] = createDebugLine(scene, lineColor);
        friendLines[i].hide();
    }
    return friendLines;
};


class BoidView {
    constructor(
            scene,
            boidGeometry = new THREE.BoxGeometry(1, 1, 1),
            boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 })) {
        this.forceLine = createDebugLine(scene, 0xffffff);
        this.repelForceLine = createDebugLine(scene, 0xff0000);
        this.attractForceLine = createDebugLine(scene, 0x00ff00);
        this.followForceLine = createDebugLine(scene, 0x0000ff);
        this.friendLines = createFriendLines(scene);

        this.boidMesh = new THREE.Mesh(boidGeometry, boidMaterial);
        this.scaleModel = randomBetween(0.2, 0.3);
        this.boidMesh.scale.set(this.scaleModel, this.scaleModel, this.scaleModel);
        this.debugAxis = createAxisGroup();
        this.boidMesh.add(this.debugAxis);
        scene.add(this.boidMesh);

        this.mesh = this.boidMesh;
    }

    update(gameBoid, context) {
        this.mesh.position.copy(gameBoid.position);

        this._handleForceLine(gameBoid, context);
        this._handleRepelLine(gameBoid, context);
        this._handleAttractLine(gameBoid, context);
        this._handleFollowLine(gameBoid, context);

        this._updateFriendLines(gameBoid, context);

        this.debugAxis.visible = context.config.showAxis;

        this.mesh.setRotationFromMatrix(getRotationMatrix(gameBoid.direction));
    }

    _hideForceLine() {
        this.forceLine.hide();
    }

    _hideRepelLine() {
        this.repelForceLine.hide();
    }

    _hideAttractLine() {
        this.attractForceLine.hide();
    }

    _hideFollowLine() {
        this.followForceLine.hide();
    }

    _updateForceLine(gameBoid) {
        const forceVector = gameBoid.position.clone();
        forceVector.add(gameBoid.getVelocity());
        this.forceLine.setLine(gameBoid.position, forceVector);
    }

    _updateRepelLine(gameBoid) {
        const forceVector = gameBoid.position.clone();
        forceVector.addScaledVector(gameBoid.forceAway, 100);

        this.repelForceLine.setLine(gameBoid.position, forceVector);
    }

    _updateFollowLine(gameBoid) {
        const followVector = gameBoid.position.clone();
        followVector.addScaledVector(gameBoid.forceToMatchVelocity, 100);

        this.followForceLine.setLine(gameBoid.position, followVector);
    }

    _updateFriendLines(gameBoid, context) {
        let friendLineIndex = 0;
        if (context.config.showFriendLines) {
            for (const friend of gameBoid.friends) {
                if (friendLineIndex < this.friendLines.length) {
                    this.friendLines[friendLineIndex].setLine(gameBoid.position, friend.position);
                }
                friendLineIndex++;
            }
        }
        for (let i = friendLineIndex; i < 10; i++) {
            this.friendLines[i].hide();
        }
    }

    _updateAttractLine(gameBoid) {
        const forceVector = gameBoid.position.clone();
        forceVector.addScaledVector(gameBoid.forceToCenter, 100);

        this.attractForceLine.setLine(gameBoid.position, forceVector);
    }

    _handleForceLine(gameBoid, context) {
        if (context.config.showForceLine) {
            this._updateForceLine(gameBoid);
        } else {
            this._hideForceLine();
        }
    }

    _handleRepelLine(gameBoid, context) {
        if (context.config.showRepelLine) {
            this._updateRepelLine(gameBoid);
        } else {
            this._hideRepelLine();
        }
    }

    _handleAttractLine(gameBoid, context) {
        if (context.config.showAttractLine) {
            this._updateAttractLine(gameBoid);
        } else {
            this._hideAttractLine();
        }
    }

    _handleFollowLine(gameBoid, context) {
        if (context.config.showFollowLine) {
            this._updateFollowLine(gameBoid);
        } else {
            this._hideFollowLine();
        }
    }
}

const createSkyView = (scene, geometry, material) => {
    if (!material) {
        material = new THREE.MeshPhongMaterial({ color: 0x6C4BE7 });
    }
    const skyMesh = new THREE.Mesh(geometry, material);
    scene.add(skyMesh);
};

const createDebugLine = (scene, color = null, depthTest = false) => {
    const friendLine = {};

    let material;
    if (color) {
        material = new THREE.LineBasicMaterial({ color });
        material.depthTest = depthTest;
    }

    const geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0));
    const mesh = new THREE.Line(geometry, material);

    scene.add(mesh);

    friendLine.setLine = (start, end) => {
        mesh.visible = true;
        geometry.vertices[0].copy(start);
        geometry.vertices[1].copy(end);
        geometry.verticesNeedUpdate = true;
    };

    friendLine.hide = () => {
        mesh.visible = false;
    };

    friendLine.show = () => {
        mesh.visible = true;
    };

    return friendLine;
};

const createFloor = (floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10), materials) => {
    let floorMaterial;
    if (materials) {
        floorMaterial = materials[0];
    } else {
        floorMaterial = new THREE.MeshPhongMaterial({ color: 0x7A3B2D, shininess: 0.0 });
    }
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.position.set(0, 0, 0);
    // floor.rotation.x = -90 * (Math.PI / 180);
    return floor;
};

const createLights = () => {
    var lights = [];
    const sunLight = new THREE.PointLight(0xf8df81, 1, 0);
    sunLight.position.set(50, 50, 0);
    lights.push(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    lights.push(ambientLight);

    return lights;
};

const createCamera = () => {
    var camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        150);
    camera.updateProjectionMatrix();
    return camera;
};

export { BoidView, createFloor, createLights, createCamera, createSkyView };