import * as THREE from 'three';

const createBoidView = (
        scene, 
        boidGeometry = new THREE.BoxGeometry(1, 1, 1), 
        boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 })) => {

    const createFriendLines = () => {
        const friendLines = [];
        for (let i = 0; i < 10; i++) {
            friendLines[i] = createFriendLine(scene);
            friendLines[i].hide();
        }
        return friendLines;
    };

    const boid = {
        directionLine: createFriendLine(scene, 0xff4444),
        forceLine: createFriendLine(scene, 0xffffff),
        repelForceLine: createFriendLine(scene, 0xff0000),
        attractForceLine: createFriendLine(scene, 0x00ff00),
        followForceLine: createFriendLine(scene, 0x0000ff),
        friendLines: createFriendLines(),
    };

    const boidMesh = new THREE.Mesh(boidGeometry, boidMaterial);

    scene.add(boidMesh);

    boid.mesh = boidMesh;

    const updateForceLine = (gameBoid) => {
        const forceVector = gameBoid.getVelocity();
        forceVector.add(gameBoid.position);
        forceVector.multiplyScalar(1.0);
        boid.forceLine.setLine(gameBoid.position, forceVector);
    };

    const updateRepelLine = (gameBoid) => {
        const forceVector = gameBoid.forceAway.clone();
        forceVector.add(gameBoid.position);
        forceVector.multiplyScalar(1);
        
        boid.repelForceLine.setLine(gameBoid.position, forceVector);
    };

    const updateFriendLines = (gameBoid) => {
        let friendLineIndex = 0;
        for (const friend of gameBoid.friends) {
            if (friendLineIndex < boid.friendLines.length) {
                boid.friendLines[friendLineIndex].setLine(gameBoid.position, friend.position);
            }
            friendLineIndex++;
        }
        for (let i = friendLineIndex; i < 10; i++) {
            boid.friendLines[i].hide();
        }
    };

    boid.update = (gameBoid) => {
        boid.mesh.position.copy(gameBoid.position);

        const directionEnd = gameBoid.position.clone();
        directionEnd.addScaledVector(gameBoid.direction, 0.5);
        boid.directionLine.setLine(gameBoid.position, directionEnd);
        
        updateForceLine(gameBoid);
        updateRepelLine(gameBoid);
        updateFriendLines(gameBoid);
    };

    return boid;
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

const createFriendLine = (scene, color) => {
    const friendLine = {};

    let material;
    if (color) {
        material = new THREE.LineBasicMaterial({ color });
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

const createFloor = () => {
    var floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
    var floorMaterial = new THREE.MeshPhongMaterial({ color: 0x6464ff });
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.position.set(0, -0.5, 0);
    floor.rotation.x = -90 * (Math.PI / 180);
    return floor;
};

const createLights = () => {
    var pointLights = [];
    pointLights[0] = new THREE.PointLight(0xffffff, 1, 0);
    pointLights[0].position.set(100, 10, 0);

    pointLights[1] = new THREE.PointLight(0xffffff, 1, 0);
    pointLights[1].position.set(0, 10, 0);

    pointLights[2] = new THREE.PointLight(0xffffff, 1, 0);
    pointLights[2].position.set(0, 0, 5);

    return pointLights;
};

const createCamera = () => {
    var camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        150);
    camera.updateProjectionMatrix();
    camera.position.y = 3;
    camera.position.z = 10;
    camera.up = new THREE.Vector3(0, 1, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
};

export { createBoidView, createFriendLine, createFloor, createLights, createCamera, createSimpleView };