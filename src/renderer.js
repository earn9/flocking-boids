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

const createBoidView = (
        scene, 
        boidGeometry = new THREE.BoxGeometry(1, 1, 1), 
        boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 })) => {

    const createFriendLines = () => {
        const lineColor = Math.random() * 0xffffff;
        const friendLines = [];
        for (let i = 0; i < 10; i++) {
            friendLines[i] = createDebugLine(scene, lineColor);
            friendLines[i].hide();
        }
        return friendLines;
    };

    const boid = {
        directionLine: createDebugLine(scene, 0xaf4484, true),
        forceLine: createDebugLine(scene, 0xffffff),
        repelForceLine: createDebugLine(scene, 0xff0000),
        attractForceLine: createDebugLine(scene, 0x00ff00),
        followForceLine: createDebugLine(scene, 0x0000ff),
        friendLines: createFriendLines(),
    };

    boid.directionLine.visible = false;

    const updateForceLine = (gameBoid) => {
        const forceVector = gameBoid.position.clone();
        forceVector.add(gameBoid.getVelocity());
        boid.forceLine.setLine(gameBoid.position, forceVector);
    };

    const hideForceLine = () => {
        boid.forceLine.hide();
    };

    const hideRepelLine = () => {
        boid.repelForceLine.hide();
    };

    const hideAttractLine = () => {
        boid.attractForceLine.hide();
    };

    const hideFollowLine = () => {
        boid.followForceLine.hide();
    };

    const updateRepelLine = (gameBoid) => {
        const forceVector = gameBoid.position.clone();
        forceVector.addScaledVector(gameBoid.forceAway, 100);
        
        boid.repelForceLine.setLine(gameBoid.position, forceVector);
    };

    const updateFollowLine = (gameBoid) => {
        const followVector = gameBoid.position.clone();
        followVector.addScaledVector(gameBoid.forceToMatchVelocity, 100);

        boid.followForceLine.setLine(gameBoid.position, followVector);
    };

    const updateFriendLines = (gameBoid, context) => {
        let friendLineIndex = 0;
        if (context.config.showFriendLines) {
            for (const friend of gameBoid.friends) {
                if (friendLineIndex < boid.friendLines.length) {
                    boid.friendLines[friendLineIndex].setLine(gameBoid.position, friend.position);
                }
                friendLineIndex++;
            }
        }
        for (let i = friendLineIndex; i < 10; i++) {
            boid.friendLines[i].hide();
        }
    };

    const updateAttractLine = (gameBoid) => {
        const forceVector = gameBoid.position.clone();
        forceVector.addScaledVector(gameBoid.forceToCenter, 100);

        boid.attractForceLine.setLine(gameBoid.position, forceVector);
    };

    const updateDirectionLine = (gameBoid) => {
        const directionEnd = gameBoid.position.clone();
        directionEnd.addScaledVector(gameBoid.direction, 0.25);
        boid.directionLine.setLine(gameBoid.position, directionEnd);
    };

    const handleForceLine = (gameBoid, context) => {
        if (context.config.showForceLine) {
            updateForceLine(gameBoid);
        } else {
            hideForceLine();
        }
    };

    const handleRepelLine = (gameBoid, context) => {
        if (context.config.showRepelLine) {
            updateRepelLine(gameBoid);
        } else {
            hideRepelLine();
        }
    };

    const handleAttractLine = (gameBoid, context) => {
        if (context.config.showAttractLine) {
            updateAttractLine(gameBoid);
        } else {
            hideAttractLine();
        }
    };

    const handleFollowLine = (gameBoid, context) => {
        if (context.config.showFollowLine) {
            updateFollowLine(gameBoid);
        } else {
            hideFollowLine();
        }
    };

    const boidMesh = new THREE.Mesh(boidGeometry, boidMaterial);
    const scaleModel = randomBetween(0.2, 0.3);
    boidMesh.scale.set(scaleModel, scaleModel, scaleModel);
    boid.debugAxis = createAxisGroup();
    boidMesh.add(boid.debugAxis);
    scene.add(boidMesh);

    boid.mesh = boidMesh;

    boid.update = (gameBoid, context) => {
        boid.mesh.position.copy(gameBoid.position);

        // updateDirectionLine(gameBoid);

        handleForceLine(gameBoid, context);
        handleRepelLine(gameBoid, context);
        handleAttractLine(gameBoid, context);
        handleFollowLine(gameBoid, context); 

        updateFriendLines(gameBoid, context);

        boid.debugAxis.visible = context.config.showAxis;

        boid.mesh.setRotationFromMatrix(getRotationMatrix(gameBoid.direction));
    };

    return boid;
};

const createSkyView = (scene, geometry, material) => {
    if (!material) {
        material = new THREE.MeshPhongMaterial({ color: 0x6C4BE7 });
    }
    const skyMesh = new THREE.Mesh(geometry, material);
    scene.add(skyMesh);
};

const createSimpleView = (
        scene, 
        boidGeometry = new THREE.BoxGeometry(1, 1, 1), 
        boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 })) => {

    const boid = {
    };

    const boidMesh = new THREE.Mesh(boidGeometry, boidMaterial);

    scene.add(boidMesh);

    boid.mesh = boidMesh;

    return boid;
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
        floorMaterial = new THREE.MeshPhongMaterial({ color: 0x7A3B2D });
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
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

export { createBoidView, createFloor, createLights, createCamera, createSimpleView, createSkyView };