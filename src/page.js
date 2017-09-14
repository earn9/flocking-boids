import { pointerLockSupported, lockPointer, onPointerLockChanged } from './pointerLockControls';

export default class Page {
    registerOnLoad(onLoad) {
        window.onload = () => onLoad(this);
    }

    addViewPort(renderer) {
        this.appendToBody(renderer.domElement);
    }

    appendToBody(element) {
        document.body.appendChild(element);
    }

    registerOnResize(onResize) {
        window.onresize = onResize;
    }

    _getElementById(id) {
        return document.getElementById(id);
    }

    isPointerLockSupported() {
        return pointerLockSupported();
    }

    registerOnPointerLockChanged(whenPointerLockChanged) {
        onPointerLockChanged(
            document, 
            (isSourceElement) => {
                var blocker = this._getElementById('blocker');
                if (isSourceElement) {
                    blocker.style.display = 'none';
                } else {
                    blocker.style.display = '';
                }
                whenPointerLockChanged(isSourceElement);
            });
    }

    registerOnClick(onClick) {
        document.body.addEventListener('click', () => onClick(this), false);
    }

    lockPointer() {
        lockPointer(document.body);
    }

    getInnerWidth() {
        return window.innerWidth;
    }

    getInnerHeight() {
        return window.innerHeight;
    }

    addKeyDownListener(onKeyDown) {
        document.addEventListener('keydown', onKeyDown, false);
    }

    getAspectRatio()  {
        return window.innerWidth / window.innerHeight;
    }

    requestAnimationFrame(internalRender) {
        window.requestAnimationFrame(internalRender);
    }
}