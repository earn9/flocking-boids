import * as THREE from 'three';

const createBoidView = (
        scene, 
        boidGeometry = new THREE.BoxGeometry(1, 1, 1), 
        boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 }), 
        startPos) => {

    const boid = {};

    const boidMesh = new THREE.Mesh(boidGeometry, boidMaterial);

    scene.add(boidMesh);

    boid.mesh = boidMesh;

    return boid;
};

const createFriendLine = (scene) => {
    const friendLine = {};

    const geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0));
    const mesh = new THREE.Line(geometry);

    scene.add(mesh);

    friendLine.setLine = (start, end) => {
        mesh.visible = true;
        geometry.vertices[0].set(start.x, start.y, start.z);
        geometry.vertices[1].set(end.x, end.y, end.z);
        geometry.verticesNeedUpdate = true;
    };

    friendLine.hide = () => {
        mesh.visible = false;
    };

    return friendLine;
};

const createFloor = () => {
    var floorGeometry = new THREE.PlaneGeometry(10, 10, 5, 5);
    var floorMaterial = new THREE.MeshPhongMaterial({ color: 0x6464ff });
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.position.set(0, -1.5, 0);
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
        10);
    var camera = new THREE.OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        0.1,
        10);
    camera.zoom = 70;
    camera.updateProjectionMatrix();
    camera.position.y = 6;
    camera.position.z = 0;
    camera.up = new THREE.Vector3(0, 1, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    return camera;
};

export { createBoidView, createFriendLine, createFloor, createLights, createCamera };