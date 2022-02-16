/**
 * All game objects should inherit BaseObject
 */
export class BaseObject {
    /**@type {Map<number, BaseObject>} */
    static baseObjects: Map<number, BaseObject> = new Map();
    static index = 0;
    id: number;
    tags: Set<Tag>;
    tagBits: number;

    constructor() {
        this.id = BaseObject.index++;
        this.tags = new Set();
        this.tagBits = 0;
    }

    /** Add a tag to this object
     * @param {Tag} tag
     */
    tag(tag: Tag) {
        this.tagBits = this.tagBits | tag.bitMask;
        this.tags.add(tag);
        tag.members.add(this);
    }

    /** Remove a tag from this object
     * @param {Tag} tag
     */
    untag(tag: Tag) {
        this.tagBits = this.tagBits & ~tag.bitMask;
        this.tags.delete(tag);
        tag.members.delete(this);
    }

    /** Checks if this object has a tag
    * @param {Tag} tag
    * @returns {boolean} `true` if object has this tag
    */
    hasTag(tag: Tag): boolean {
        //return this.tags.has(tag);
        return (this.tagBits & tag.bitMask) != 0;
    }

    /**
     * Removes this object 
     */
    remove() {
        BaseObject.baseObjects.delete(this.id);
    }
}

export class Tag {
    members: Set<unknown>;
    bitMask: number;
    constructor() {
        if (Tag.bitIndex > 31) {
            throw new Error("Cannot create more than 32 tags.");
        }

        /**@type {Set<BaseObject>} Set of all objects with this tag */
        this.members = new Set();
        Tag.bitIndex = Tag.bitIndex++;
        this.bitMask = 1 << Tag.bitIndex;
    }

    /** Creates new array containing only tagged objects
     * @param {Array<BaseObject>} set
     * @param {Tag} tag
     * @returns {BaseObject[]} filtered array
     */
    static filter(set: Array<BaseObject>, tag: Tag): BaseObject[] {
        let output = [];

        for (const e of set) {
            if (e.hasTag(tag)) {
                output.push(e);
            }
        }

        return output;
    }

    /** Runs `func` for every tagged member of `set`
     * @param {Array<BaseObject>} set
     * @param {Tag} tag
     * @param {Function} func
     */

    static for(set: Array<BaseObject>, tag: Tag, func: Function) {
        for (const e of set) {
            if (e.hasTag(tag)) {
                func(e);
            }
        }
    }

    static bitIndex = 0;
}
