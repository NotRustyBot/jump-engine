import { BaseObject } from "./handlers/objectHandler";

export class Component {
    componentId: number;
    parent: BaseObject;

    private static index: number = 0;
    static components: Map<number,Component> = new Map();
    constructor(parent: BaseObject) {
        this.componentId = Component.index;
        Component.index++;
        this.parent = parent;
    }
}