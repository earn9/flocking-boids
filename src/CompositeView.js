export default class CompositeView {
    constructor(children) {
        this.children = children;
    }
    update(context, delta) {
        for (const child of this.children) {
            child.update(context, delta);
        }
    }
}