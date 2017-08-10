import { pointerLockSupported, lockPointer, onPointerLockChanged } from './pointerLockControls';

export default class Page {
    registerOnLoad(onLoad) {
        window.onload = () => onLoad(this);
    }

    appendToBody(element) {
        document.body.appendChild(element);
    }

    registerOnResize(onResize) {
        window.onresize = onResize;
    }

    getElementById(id) {
        return document.getElementById(id);
    }

    isPointerLockSupported() {
        return pointerLockSupported();
    }

    registerOnPointerLockChanged(whenPointerLockChanged) {
        return onPointerLockChanged(document, whenPointerLockChanged);
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
}