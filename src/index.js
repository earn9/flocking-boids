import * as THREE from 'three';
import { createWorld, createBoidWithRandomPositionAndDirection } from './game';
import { createBoidView, createFloor, createLights, createCamera, createSkyView } from './renderer';
import { initializeConfig, storeConfigChanges } from './persistance';
import PointerLockControler, { pointerLockSupported, lockPointer, onPointerLockChanged } from './pointerLockControls';
import CameraController from './CameraController';

const context = {
    config: {
        showForceLine: false,
        showRepelLine: false,
        showAttractLine: false,
        showFollowLine: false,
        showFriendLines: false,
        showAxis: false
    },
    simulationRunning: false,
    zoom: false
};

const update = (delta, boidsViews, world) => {
    world.update(delta);
    for (const boidView of boidsViews) {
        const boid = world.getBoid(boidView.tag);
        boidView.update(boid, context);
    }
};

// setup a bunch of boids that should flock
const setupBoids = (scene, world, boidGeometry, boidMaterial, boids = []) => {
    const numBoids = 500;

    for (let i = 0; i < numBoids; i++) {
        const boidView = createBoidView(scene, boidGeometry, boidMaterial);
        boidView.tag = i;
        boids.push(boidView);

        world.addBoid(createBoidWithRandomPositionAndDirection(-20, 20, 1, boidView.tag));
    }
};

const cameraKey = 'camera';

const boids = [];

const setup = (scene, assetRoot = '') => {
    initializeConfig(context.config);
    const world = createWorld();

    const boidGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boidMaterial = new THREE.MeshPhongMaterial({ color: 0xff6464 });

    const loader = new THREE.JSONLoader();
    loader.load(`${assetRoot}/assets/models/skySphere.json`, (geometry, materials) => {
        createSkyView(scene, geometry, materials);
    });
    loader.load(`${assetRoot}/assets/models/birdSimple02.json`, (geometry, materials) => { 
        setupBoids(scene, world, geometry, materials[0], boids);
     });
    // setupBoids(scene, world, boidGeometry, boidMaterial, boids);
    loader.load(`${assetRoot}/assets/models/terain01.json`, (geometry, material) => {
        scene.add(createFloor(geometry, material));
    });

    for (const light of createLights()) {
        scene.add(light);
    }

    var camera = createCamera();

    world.addController(new CameraController(camera), cameraKey);

    return { world, boids, camera };
};

const createRenderLoop = (clock, boids, scene, camera, renderer, world) => {
    const internalRender = () => {
        window.requestAnimationFrame(internalRender);

        var delta = clock.getDelta();
        if (context.simulationRunning) {
            update(delta, boids, world);
        }

        renderer.render(scene, camera);
    };
    return internalRender;
};

const KEYS = {
    KEY_B: 66,
    KEY_F: 70,
    KEY_I: 73,
    KEY_U: 85,
    KEY_O: 79,
    KEY_P: 80,
    KEY_Y: 89,
    KEY_Z: 90
};

const toggleForceLine = () => {
    context.config.showForceLine = !context.config.showForceLine;
};

const toggleAttractLine = () => {
    context.config.showAttractLine = !context.config.showAttractLine;
};

const createOnDocumentKeyDown = (cameraController, domElement) => 
    (event) => {
        console.log('keydown', event);
        switch (event.keyCode) {
            case KEYS.KEY_Y:
                toggleForceLine();
                break;
            case KEYS.KEY_U:
                context.config.showRepelLine = !context.config.showRepelLine;
                break;
            case KEYS.KEY_I:
                toggleAttractLine();
                break;
            case KEYS.KEY_O:
                context.config.showFollowLine = !context.config.showFollowLine;
                break;
            case KEYS.KEY_P:
                context.config.showFriendLines = !context.config.showFriendLines;
                break;
            case KEYS.KEY_B:
                context.config.showAxis = !context.config.showAxis;
                break;
            case KEYS.KEY_Z:
                context.zoom = !context.zoom;
                if (context.zoom) {
                    cameraController.zoomIn();
                } else {
                    cameraController.zoomOut();
                }
                break;
            case KEYS.KEY_F:
                context.fullscreen = !context.fullscreen;
                if (context.fullscreen) {
                    if (domElement.webkitRequestFullscreen) {
                        domElement.webkitRequestFullscreen();
                    }
                }
                break;

        }
        storeConfigChanges(context.config);
    };

const setupKeyboardListeners = (cameraController, domElement) => {
    document.addEventListener('keydown', createOnDocumentKeyDown(cameraController, domElement), false);
};

const createHandleWindowResize = (camera, renderer) => 
    () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    };

let controls;

export function startUp(assetRoot = '') {
    var blocker = document.getElementById( 'blocker' );

    window.onload = () => {
        var scene = new THREE.Scene();

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

        var { world, boids, camera } = setup(scene, assetRoot);

        window.onresize = createHandleWindowResize(camera, renderer);

        if (pointerLockSupported()) {
            const controls = new PointerLockControler(camera);
            world.getControllerByName(cameraKey).setPointerLockControls(controls);
            scene.add(controls.getObject());
            controls.getObject().position.setX(0);
            controls.getObject().position.setY(1);
            controls.getObject().position.setZ(30);

            onPointerLockChanged(document, (isSourceElement) => {
                if (isSourceElement) {
                    controls.enabled = true;
                    blocker.style.display = 'none';
                    context.simulationRunning = true;
                } else {
                    controls.enabled = false;
                    blocker.style.display = '';
                    context.simulationRunning = false;
                }
            });

            document.body.addEventListener(
                'click', 
                () => {
                    controls.enabled = true;    
                    lockPointer(document.body);
                    blocker.style.display = 'none';
                }, 
                false);
        } else {
            console.log('pointer lock not supported');
        }
        setupKeyboardListeners(world.getControllerByName(cameraKey), renderer.domElement);

        var clock = new THREE.Clock();

        var render = createRenderLoop(clock, boids, scene, camera, renderer, world);

        render();
    };
}