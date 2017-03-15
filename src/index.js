import * as THREE from 'three';
import { createBoid, createWorld } from './game';

const createCube = (scene) => {
    const cube = {};

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xff6464 });
    const cubeMesh = new THREE.Mesh(geometry, material);

    scene.add(cubeMesh);

    cube.update = (delta) => {
        cubeMesh.rotation.x += delta * 0.6;
        cubeMesh.rotation.y += delta * 0.8;
    };

    return cube;
};

const randomBetween = (min, max) => {
    return Math.random() * (max - min) + min;
};

const randomVec2 = (min, max) => {
    return {
        x: randomBetween(min, max),
        y: randomBetween(min, max)
    };
};

const randomDirection = () => {
    const factor = 2 * Math.PI * Math.random();

    return {
        x: Math.cos(factor),
        y: Math.sin(factor)
    };
};

const createBoidMesh = (scene, boidGeometry, boidMaterial, startPos) => {
    const boid = {};

    const geometry = boidGeometry || new THREE.BoxGeometry(1, 1, 1);
    const material = boidMaterial || new THREE.MeshPhongMaterial({ color: 0xff6464 });
    const boidMesh = new THREE.Mesh(geometry, material);

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

const update = (delta, graph, world) => {
    world.update(delta);
    for (const node of graph.boids) {
        const boid = world.getBoid(node.tag);
        const { x, y, z } = boid.position;
        node.mesh.position.set(x, y, z);
        if (boid.friend) {
            graph.friendLines[node.tag].setLine(node.mesh.position, boid.friend.position);
        } else {
            graph.friendLines[node.tag].hide();
        }
    }
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

const setup = (scene) => {
    const world = createWorld();
    const graph = { boids: [], friendLines: [] };

    const boidGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 });

    const numBoids = 100;

    for (let i = 0; i < numBoids; i++) {
        const boid = createBoidMesh(scene, boidGeometry, boidMaterial);
        boid.tag = i;
        graph.boids.push(boid);

        graph.friendLines[i] = createFriendLine(scene);

        const { x: xPos, y: yPos } = randomVec2(-5, 5);
        const location = new THREE.Vector3(xPos, 0, yPos);

        const { x: xDir, y: yDir } = randomDirection();
        const direction = new THREE.Vector3(xDir, 0, yDir);

        var speed = 0.75;
        world.addBoid(location, direction, speed, boid.tag);
    }

    scene.add(createFloor());

    var pointLights = createLights();

    for (const light of pointLights) {
        scene.add(light);
    }

    var camera = createCamera();

    return { world, graph, camera };
};

const createRenderLoop = (clock, graph, scene, camera, renderer, world) => {
    const internalRender = () => {
        window.requestAnimationFrame(internalRender);

        var delta = clock.getDelta();
        update(delta, graph, world);

        renderer.render(scene, camera);
    }
    return internalRender;
};

window.onload = () => {
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var { world, graph, camera } = setup(scene);

    var clock = new THREE.Clock();

    var render = createRenderLoop(clock, graph, scene, camera, renderer, world);

    render();
};