import * as THREE from 'three';
import { createBoid, createWorld, createBoidWithRandomPositionAndDirection } from './game';
import { createBoidView, createFloor, createLights, createCamera, createSimpleView } from './renderer';
import { createSeeker } from './steering';

const update = (delta, boids, world) => {
    world.update(delta);
    for (const node of boids) {
        const boid = world.getBoid(node.tag);
        node.update(boid);
    }
};

// setup a bunch of boids that should flock
const setupBoids = (scene, world, boidGeometry, boidMaterial) => {
    const numBoids = 50;
    const boids = [];

    for (let i = 0; i < numBoids; i++) {
        const boid = createBoidView(scene, boidGeometry, boidMaterial);
        boid.tag = i;
        boids.push(boid);

        world.addBoid(createBoidWithRandomPositionAndDirection(-5, 5, 0.75), boid.tag);
    }
    return boids;
};

// sets up a simple test of steering
const setupSteering = (scene, world, boidGeometry, boidMaterial) => {
    const boids = [];

    const boidView = createBoidView(scene, boidGeometry, boidMaterial);
    boidView.tag = "seeker";
    boids.push(boidView);

    const targetView = createSimpleView(scene, boidGeometry, boidMaterial);

    const seeker = createSeeker(
        new THREE.Vector3(5, 0, 5), 
        new THREE.Vector3(1, 0, 0), 
        4, 
        new THREE.Vector3(0, 0, 0),
        boidView.tag);

    world.addBoid(seeker, boidView.tag);

    return boids;
};

const setup = (scene) => {
    const world = createWorld();

    const boidGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 });

    const boids = setupSteering(scene, world, boidGeometry, boidMaterial);

    scene.add(createFloor());

    for (const light of createLights()) {
        scene.add(light);
    }

    var camera = createCamera();

    return { world, boids, camera };
};

const createRenderLoop = (clock, boids, scene, camera, renderer, world) => {
    const internalRender = () => {
        window.requestAnimationFrame(internalRender);

        var delta = clock.getDelta();
        update(delta, boids, world);

        renderer.render(scene, camera);
    }
    return internalRender;
};

window.onload = () => {
    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    var { world, boids, camera } = setup(scene);

    var clock = new THREE.Clock();

    var render = createRenderLoop(clock, boids, scene, camera, renderer, world);

    render();
};
