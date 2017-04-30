import * as THREE from 'three';

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

    const boidMesh = new THREE.Mesh(boidGeometry, boidMaterial);

    scene.add(boidMesh);

    boid.mesh = boidMesh;

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

    boid.update = (gameBoid, context) => {
        boid.mesh.position.copy(gameBoid.position);

        updateDirectionLine(gameBoid);

        handleForceLine(gameBoid, context);
        handleRepelLine(gameBoid, context);
        handleAttractLine(gameBoid, context);
        handleFollowLine(gameBoid, context); 

        updateFriendLines(gameBoid, context);
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

export { createBoidView, createFloor, createLights, createCamera, createSimpleView };