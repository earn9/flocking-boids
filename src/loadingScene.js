import * as THREE from 'three';

class RotatingView {
    constructor(mesh) {
        this.mesh = mesh;
    }
     update(context, delta) {
         console.log(`rotating view, delta: ${delta}`);
         this.mesh.rotation.x += 1 * delta;
         this.mesh.rotation.y += 1 * delta;
     }
}

export default function createLoadingScene() {
    const scene = new THREE.Scene();
    const loadingIconGeometry = new THREE.BoxGeometry(1, 1, 1);
    const loadingIconMaterial = new THREE.MeshBasicMaterial({ color: 0xff6464 });
    const loadingIconMesh = new THREE.Mesh(loadingIconGeometry, loadingIconMaterial);
    scene.add(loadingIconMesh);

    const loadingView = new RotatingView(loadingIconMesh);

    return { loadingScene: scene, loadingView };
}

export function setupLoadingCamera(camera) {
    camera.position.z = 5;
    camera.lookAt( new THREE.Vector3() );
    camera.updateProjectionMatrix();
}