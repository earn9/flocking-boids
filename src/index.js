import * as THREE from 'three';
import { createBoid, createWorld } from './game';
import { createBoidView, createFloor, createLights, createCamera } from './renderer';

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

const update = (delta, graph, world) => {
    world.update(delta);
    for (const node of graph.boids) {
        const boid = world.getBoid(node.tag);
        node.update(boid);
    }
};

const setup = (scene) => {
    const world = createWorld();
    const graph = { boids: [] };

    const boidGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 });

    const numBoids = 50;

    for (let i = 0; i < numBoids; i++) {
        const boid = createBoidView(scene, boidGeometry, boidMaterial);
        boid.tag = i;
        graph.boids.push(boid);

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
