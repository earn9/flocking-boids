import * as THREE from 'three';
import { World } from './game/world';
import { Boid } from './game/boid';
import { BoidView, createFloor, createLights, createCamera, createSkyView } from './renderer';
import { initializeConfig, storeConfigChanges } from './persistence';
import PointerLockControler, { pointerLockSupported, lockPointer, onPointerLockChanged } from './pointerLockControls';
import CameraController from './CameraController';
import loadAllResources from './resources';

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
        boidView.update(boid, context, delta);
    }
};

// setup a bunch of boids that should flock
const setupBoids = (scene, world, boidGeometry, boidMaterial, boids = []) => {
    const numBoids = 500;

    for (let i = 0; i < numBoids; i++) {
        const boidView = new BoidView(scene, boidGeometry, boidMaterial);
        boidView.tag = i;
        boids.push(boidView);
        world.addBoid(Boid.createWithRandomPositionAndDirection(-20, 20, 1, boidView.tag));
    }
};

const cameraKey = 'camera';

const boids = [];

const setup = async (scene, assetRoot = '') => {
    initializeConfig(context.config);
    const world = new World();

    const resources = [
        { 
            url: `${assetRoot}/assets/models/skySphere.json`,
            onSuccess: skySphere => createSkyView(scene, skySphere.geometry, skySphere.materials)
        },
        { 
            url: `${assetRoot}/assets/models/birdSimple02.json`,
            onSuccess: bird => setupBoids(scene, world, bird.geometry, bird.materials[0], boids)
        },
        { 
            url: `${assetRoot}/assets/models/terain01.json`,
            onSuccess: terrain => scene.add(createFloor(terrain.geometry, terrain.material))
        }
    ];

    await loadAllResources(resources);

    console.log('loading done!');

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

export function startUp(assetRoot = '') {

    window.onload = async () => {
        var scene = new THREE.Scene();

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.body.appendChild(renderer.domElement);

        var { world, boids, camera } = await setup(scene, assetRoot);

        console.log('setup complete');

        window.onresize = createHandleWindowResize(camera, renderer);

        if (pointerLockSupported()) {
            const controls = new PointerLockControler(camera);
            world.getControllerByName(cameraKey).setPointerLockControls(controls);
            scene.add(controls.getObject());
            controls.getObject().position.setX(0);
            controls.getObject().position.setY(1);
            controls.getObject().position.setZ(30);
            
            var blocker = document.getElementById( 'blocker' );

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