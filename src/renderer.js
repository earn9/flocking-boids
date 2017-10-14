import * as THREE from 'three';
import { randomBetween } from './mathUtils';

const center = new THREE.Vector3(0, 0, 0);
const yAxisNormal = new THREE.Vector3(0, 1, 0);

const xAxisHalfNormal = new THREE.Vector3(0.5, 0, 0);
const yAxisHalfNormal = new THREE.Vector3(0, 0.5, 0);
const zAxisHalfNormal = new THREE.Vector3(0, 0, 0.5);

const createAxisGroup = () => {
    const group = new THREE.Group();
    const xAxisLine = new DebugLine(group, 0xff0000);
    xAxisLine.setLineEnd(xAxisHalfNormal);
    const yAxisLine = new DebugLine(group, 0x00ff00);
    yAxisLine.setLineEnd(yAxisHalfNormal);
    const zAxisLine = new DebugLine(group, 0x0000ff);
    zAxisLine.setLineEnd(zAxisHalfNormal);
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
        friendLines[i] = new DebugLine(scene, lineColor);
        friendLines[i].hide();
    }
    return friendLines;
};

const getClipAction = (mixer, animationClips, clipName) => {
    const clip = THREE.AnimationClip.findByName(animationClips, clipName);
    const result = mixer.clipAction(clip);
    if (!result) {
        throw new Error(`Could not find clip ${clipName}`);
    }
    return result;
};

const flappingActionName = 'Flapping';
const glidingActionName = 'Gliding';

class BoidView {

    constructor(
        scene,
        boidGeometry = new THREE.BoxGeometry(1, 1, 1),
        boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 }),
        gameBoid
    ) {

        this.gameBoid = gameBoid;
        let boidMesh;
        if (boidGeometry.animations) {
            this.mixer = new THREE.AnimationMixer(boidMesh);
            this.animationClips = boidGeometry.animations;
            this.flappingAction = getClipAction(this.mixer, this.animationClips, flappingActionName);
            this.glidingAction = getClipAction(this.mixer, this.animationClips, 'Gliding');
            this.flappingAction
                .startAt(this.mixer.time + randomBetween(0, 1))
                .play();
            boidMaterial.skinning = true;
            boidMesh = new THREE.SkinnedMesh(boidGeometry, boidMaterial)
        } else {
            boidMesh = new THREE.Mesh(boidGeometry, boidMaterial); 
        }

        this.modelScale = randomBetween(0.2, 0.3);
        boidMesh.scale.set(this.modelScale, this.modelScale, this.modelScale);
        this.debugAxis = createAxisGroup();
        boidMesh.add(this.debugAxis);
        this.forceLine = new DebugLine(boidMesh, 0xffffff);
        this.repelForceLine = new DebugLine(boidMesh, 0xff0000);
        this.attractForceLine = new DebugLine(boidMesh, 0x00ff00);
        this.followForceLine = new DebugLine(boidMesh, 0x0000ff);
        //this.friendLines = createFriendLines(boidMesh);

        this._timeTillThink = randomBetween(5, 10);
        this._timeSinceThink = 0;

        this._currentActionName = 'Flapping';

        scene.add(boidMesh);

        this.mesh = boidMesh;
    }

    update(context, delta) {
        this._timeSinceThink += delta;

        if (this._timeSinceThink > this._timeTillThink) {
            this._think();
            this._timeSinceThink = 0;
        }

        this.mesh.position.copy(this.gameBoid.position);

        this._handleForceLine(this.gameBoid, context);
        this._handleRepelLine(this.gameBoid, context);
        this._handleAttractLine(this.gameBoid, context);
        this._handleFollowLine(this.gameBoid, context);

        this._updateFriendLines(this.gameBoid, context);

        this.debugAxis.visible = context.config.showAxis;

        this.mesh.setRotationFromMatrix(getRotationMatrix(this.gameBoid.direction));

        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    _think() {
        if (!this.mixer) return;

        if (this._currentActionName === flappingActionName) {
            this.glidingAction.enabled = true;
            this.flappingAction.crossFadeTo(this.glidingAction, 0.5);
            this._currentActionName = glidingActionName;
        } else {
            this.flappingAction.enabled = true;
            this.glidingAction.crossFadeTo(this.flappingAction, 0.5);
            this._currentActionName = flappingActionName;
        }
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
        const forceVector = gameBoid.getVelocity().clone();
        forceVector.add(this.mesh.position);
        this.mesh.worldToLocal(forceVector);
        this.forceLine.setLineEnd(forceVector);
    }

    _updateRepelLine(gameBoid) {
        const forceVector = center.clone();
        forceVector.addScaledVector(gameBoid.forceAway, 100);
        forceVector.add(this.mesh.position);
        this.mesh.worldToLocal(forceVector);
        this.repelForceLine.setLineEnd(forceVector);
    }

    _updateFollowLine(gameBoid) {
        const forceVector = center.clone();
        forceVector.addScaledVector(gameBoid.forceToMatchVelocity, 100);
        forceVector.add(this.mesh.position);
        this.mesh.worldToLocal(forceVector);
        this.followForceLine.setLineEnd(forceVector);
    }

    _updateAttractLine(gameBoid) {
        const forceVector = center.clone();
        forceVector.addScaledVector(gameBoid.forceToCenter, 100);
        forceVector.add(this.mesh.position);
        this.mesh.worldToLocal(forceVector);
        this.attractForceLine.setLineEnd(forceVector);
    }

    _getFriendLines() {
        if (!this.friendLines) {
            this.friendLines = createFriendLines(this.mesh);
        }
        return this.friendLines;
    }
    _updateFriendLines(gameBoid, context) {
        let friendLineIndex = 0;
        const friendLines = this._getFriendLines();
        if (context.config.showFriendLines) {
            for (const friend of gameBoid.friends) {
                if (friendLineIndex < friendLines.length) {
                    const localFriendPosition = friend.position.clone();
                    this.mesh.worldToLocal(localFriendPosition);
                    friendLines[friendLineIndex].setLineEnd(localFriendPosition);
                }
                friendLineIndex++;
            }
        }
        for (let i = friendLineIndex; i < 10; i++) {
            friendLines[i].hide();
        }
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

const createSkyView = (geometry, material = new THREE.MeshPhongMaterial({ color: 0x6C4BE7 })) => {
    return new THREE.Mesh(geometry, material);
};

class DebugLine {
    constructor(scene, color = null, depthTest = false) {
        let material;
        if (color) {
            material = new THREE.LineBasicMaterial({ color });
            material.depthTest = depthTest;
        }
        
        this.geometry = new THREE.Geometry();
        this.geometry.vertices.push(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0));
        this.mesh = new THREE.Line(this.geometry, material);
    
        scene.add(this.mesh);
    }

    setLineEnd(end) {
        this.show();
        this.geometry.vertices[1].copy(end);
        this.geometry.verticesNeedUpdate = true;        
    }

    hide() {
        this.mesh.visible = false;
    }

    show() {
        this.mesh.visible = true;
    }
}

const createFloor = (floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10), materials) => {
    let floorMaterial;
    if (materials) {
        floorMaterial = materials[0];
    } else {
        floorMaterial = new THREE.MeshPhongMaterial({ color: 0x7A3B2D, shininess: 0.0 });
    }
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.position.set(0, 0, 0);
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