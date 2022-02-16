import { BaseObject } from "./handlers/objectHandler";

export class Component {
    componentId: number;
    parent: BaseObject;

    private static index: number = 0;
    static components: Component[] = [];
    constructor(parent: BaseObject) {
        this.componentId = Component.index;
        Component.components[this.componentId] = this;
        Component.index++;
        this.parent = parent;
    }
}