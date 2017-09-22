import * as THREE from 'three';
import VRControls from 'three-vrcontrols-module';
import VREffect from 'three-vreffect-module';
import * as webvrui from 'webvr-ui';

import { World } from './game/world';
import { Boid } from './game/boid';
import { BoidView, createFloor, createLights, createCamera, createSkyView } from './renderer';
import { initializeConfig, storeConfigChanges } from './persistence';
import loadAllResourcesAsync from './resources';
import Page from './page';
import createLoadingExperience from './loadingScene';
import CompositeView from './CompositeView';
import Experience from './Experience';

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

const createKeyHandlingStrategies = (cameraController, domElement) => ({
    [KEYS.KEY_Y]: program => program.context.config.toggleForceLine(),
    [KEYS.KEY_U]: program => program.context.config.toggleRepelLines(),
    [KEYS.KEY_I]: program => program.context.config.toggleAttractLine(),
    [KEYS.KEY_O]: program => program.context.config.toggleFollowLine(),
    [KEYS.KEY_P]: program => program.context.config.toggleFriendLines(),
    [KEYS.KEY_B]: program => program.context.config.toggleAxis(),
    [KEYS.KEY_Z]: () => {
        cameraController || cameraController.zoom();
    },
    [KEYS.KEY_F]: program => {
        program.context.toggleFullscreen();
        if (program.context.fullscreen) {
            if (domElement.webkitRequestFullscreen) {
                domElement.webkitRequestFullscreen();
            }
        }
    }
});

const mainSceneResources = [
    {
        name: 'skySphere',
        url: '/assets/models/skySphere.json'
    },
    {
        name: 'bird',
        url: '/assets/models/birdSimple02.json'
    },
    {
        name: 'terrain',
        url: '/assets/models/terain01.json'
    }
];

class Config {
    constructor() {
        this.showForceLine = false;
        this.showRepelLine = false;
        this.showAttractLine = false;
        this.showFollowLine = false;
        this.showFriendLines = false;
        this.showAxis = false;
    }

    toggleForceLine() {
        this.showForceLine = !this.showForceLine;
    }

    toggleAttractLine() {
        this.showAttractLine = !this.showAttractLine;
    }

    toggleRepelLines() {
        this.showRepelLine = !this.showRepelLine;
    }

    toggleFollowLine() {
        this.showFollowLine = !this.showFollowLine;
    }

    toggleFriendLines() {
        this.showFriendLines = !this.showFriendLines;
    }

    toggleAxis() {
        this.showAxis = !this.showAxis;
    }

    toggleZoom() {
        this.zoom = !this.zoom;
    }

    toggleFullscreen() {
        this.fullscreen = !this.fullscreen;
    }
}

class Context {
    constructor(config = new Config()) {
        this.config = config;
        this.simulationRunning = false;
        this.zoom = false;
    }

    toggleZoom() {
        this.zoom = !this.zoom;
    }

    toggleFullscreen() {
        this.fullscreen = !this.fullscreen;
    }
}

class Program {
    constructor(assetRoot = '') {
        this.assetRoot = assetRoot;
        this.page = new Page();
        this.context = new Context();
    }

    _setupBoids(scene, world, boidGeometry, boidMaterial, boids = []) {
        const numBoids = 200;

        for (let i = 0; i < numBoids; i++) {
            const gameBoid = Boid.createWithRandomPositionAndDirection(-20, 20, 1);
            world.addBoid(gameBoid);
            const boidView = new BoidView(scene, boidGeometry, boidMaterial, gameBoid);
            boids.push(boidView);
        }
    }

    async _setupMainSceneAync() {
        initializeConfig(this.context.config);
        const world = new World();

        const boids = [];
        const resources = await loadAllResourcesAsync(mainSceneResources, this.assetRoot);

        const scene = new THREE.Scene();
        const resourceStratergies = this._createResourcesStrategies(scene, world, boids);
        resources.forEach(x => resourceStratergies[x.name](x));

        for (const light of createLights()) {
            scene.add(light);
        }

        return { world, boids, scene };
    }

    _createRenderLoop(renderer) {
        const clock = new THREE.Clock();

        const internalRender = () => {
            (this.vrDisplay || window).requestAnimationFrame(internalRender);

            var delta = clock.getDelta();
            if (this.context.simulationRunning) {
                this.experience.update(delta, this.context);
            }

            if (this.controls) {
                this.controls.update();
            }

            this.experience.renderUsing(renderer);

            if (this.enterVR.isPresenting()) {
                this.experience.renderUsing(this.effect);
            }
        };
        return internalRender;
    }

    _createResourcesStrategies(scene, world, boids) {
        return {
            skySphere: skySphere => scene.add(createSkyView(skySphere.geometry, skySphere.materials)),
            bird: bird => this._setupBoids(scene, world, bird.geometry, bird.materials[0], boids),
            terrain: terrain => scene.add(createFloor(terrain.geometry, terrain.material))
        };
    }

    _createDocumentKeyDownHandler(keyHandlingStrategies) {
        return (event) => {
            console.log('keydown', event);
            const handler = keyHandlingStrategies[event.keyCode];
            if (handler) {
                handler(this);
                storeConfigChanges(this.context.config);
                return;
            } else {
                console.log(`no handler found for key ${event.keyCode}`);
            }
            storeConfigChanges(this.context.config);
        };
    }

    _createWindowResizeHandler(renderer) {
        return () => {
            this.experience.pageResized(this.page);

            renderer.setSize(this.page.getInnerWidth(), this.page.getInnerHeight());
        };
    }

    async _createFlockingExperienceAsync(localPage, renderer, camera) {
        var { world, boids, scene } = await this._setupMainSceneAync(this.assetRoot);


        console.log('setup complete');


        localPage.addKeyDownListener(
            this._createDocumentKeyDownHandler(
                createKeyHandlingStrategies(
                    null,
                    renderer.domElement)));

        const dolly = new THREE.Group();
        dolly.add(camera);
        dolly.position.set(0, 1, 30);
        scene.add(dolly);
        return new Experience(scene, camera, new CompositeView(boids), world);
    }

    async _startAppAsync(page) {

        var glRenderer = new THREE.WebGLRenderer({antialias: true});
        glRenderer.setSize(page.getInnerWidth(), page.getInnerHeight());

        page.addViewPort(glRenderer);        
        page.registerOnResize(this._createWindowResizeHandler(glRenderer));
        
        var camera = createCamera();        
        
        this.experience = createLoadingExperience(camera);

        this.context.simulationRunning = true;

        this.controls = new VRControls(camera);

        this.enterVR = new webvrui.EnterVRButton(glRenderer.domElement, {});
        document.getElementById('button').appendChild(this.enterVR.domElement);
        

        this.effect = new VREffect(glRenderer);
        this.effect.setSize(window.innerWidth,  window.innerHeight);

        try {
            this.vrDisplay = await this.enterVR.getVRDisplay();
            //glRenderer.vr.setDisplay(this.vrDisplay);
        } catch (ex) {
            console.log('no VR ', ex);
        }
        
        this._createRenderLoop(this.vrDisplay ? this.effect : glRenderer)();
        
        // this.vrDisplay = null;
        // navigator.getVRDisplays().then(function(displays) {
        //   if (displays.length > 0) {
        //     scope.vrDisplay = displays[0];
        //     // Kick off the render loop.
        //     scope.vrDisplay.requestAnimationFrame(scope._createRenderLoop(scope.effect));
        //   }
        // });

        this.renderer = glRenderer;

        this.experience = await this._createFlockingExperienceAsync(page, glRenderer, camera);
        this.context.simulationRunning = true;        
        this.doneWithLoadingLoop = true;
    }

    run() {
        this.page.registerOnLoad(async page => await this._startAppAsync(page));
    }
}


export function startUp(assetRoot = '') {
    new Program(assetRoot).run();
}