class BaseObject {
    /**@type {Map<number, BaseObject>} */
    static baseObjects = new Map();
    static index = 0;

    constructor() {
        this.id = BaseObject.index++;
        /** @type {Set<Tag>} */
        this.tags = new Set();
        this.tagBits = 0;
    }

    /**
     * @param {Tag} tag
     */
    tag(tag) {
        this.tagBits = this.tagBits | tag.bitMask;
        this.tags.add(tag);
        tag.members.add(this);
    }

    /**
     * @param {Tag} tag
     */
    untag(tag) {
        this.tagBits = this.tagBits & ~tag.bitMask;
        this.tags.delete(tag);
        tag.members.delete(this);
    }

    /**
    * @param {Tag} tag
    */
    hasTag(tag) {
        return (this.tagBits & tag.bitMask) != 0;
    }

    remove() {
        BaseObject.baseObjects.delete(this);
    }
}

exports.BaseObject = BaseObject;

class Tag {
    constructor() {
        if (Tag.bitIndex > 31) {
            throw new Error("Cannot create more than 32 tags.");
        }

        this.members = new Set();
        this.bitIndex = Tag.bitIndex++;
        this.bitMask = 1 << this.bitIndex;
    }

    /**
     * @param {Array<BaseObject>} set
     * @param {Tag} tag
     */
    static filter(set, tag) {
        let output = [];

        for (const e of set) {
            if (e.hasTag(tag)) {
                output.push(e);
            }
        }

        return output;
    }

    /**
     * @param {ArrayLike<BaseObject>} set
     * @param {tag} tag
     * @param {Function} func
     */

    static for(set, tag, func) {
        for (const e of set) {
            if (e.hasTag(tag)) {
                func(e);
            }
        }
    }

    static bitIndex = 0;
}

let Tags = { collisionObject: new Tag() };
exports.Tag = Tag;
exports.Tags = Tags;