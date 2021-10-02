class BaseObject {
    /**@type {Map<number, BaseObject>} */
    static baseObjects = new Map();
    static index = 0;

    constructor() {
        this.id = BaseObject.index++;
        /** @type {Set<Tag>} */
        this.tags = new Set();
    }

    /**
     * @param {Tag} tag
     */
    tag(tag) {
        this.tags.add(tag);
        tag.members.add(this);
    }

    /**
     * @param {Tag} tag
     */
    untag(tag) {
        this.tags.delete(tag);
        tag.members.delete(this);
    }

    remove() {
        BaseObject.baseObjects.delete(this);
    }
}

exports.BaseObject = BaseObject;

class Tag {
    constructor() {
        this.members = new Set();
    }

    /**
     * @param {Iterable<BaseObject>} set
     * @param {tag} tag
     */
    static filter(set, tag) {
        let output = [];
        set.forEach((e) => {
            if (tag.members.has(e)) {
                output.push(e);
            }
        });
        return output;
    }

    /**
     * @param {Iterable<BaseObject>} set
     * @param {tag} tag
     * @param {Function} func
     */

    static for(set, tag, func) {
        set.forEach((e) => {
            if (tag.members.has(e)) {
                func(e);
            }
        });
    }
}

let Tags = {};
exports.Tag = Tag;
exports.Tag = Tag;
