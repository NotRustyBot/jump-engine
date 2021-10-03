const { BaseObject } = require("./objectHandler");
const { Vector } = require("./types");
const { UpdateHandler } = require("./updateHandler");

class PhysicsObject extends BaseObject {
    constructor() {
        super();
        this.position = new Vector();
    }
}

exports.PhysicsObject = PhysicsObject;

class Area {
    /**
     * @param {Vector} position
     */
    constructor(position) {
        /**@type {Set<PhysicsObject>} */
        this.members = new Set();
        this.gridPosition = new Vector(position.x, position.y);
        this.positionIndex = Area.toGridIndex(this.gridPosition);

        Area.areas.set(this.positionIndex, this);
    }

    /**
     * @param {Vector} vector
     * @returns {number}
     */
    static toGridIndex(vector) {
        return ((vector.x & 0xFFFF) << 16) | (vector.y & 0xFFFF);
    }

    static areaSize = 1000;
    /**@type {Map<number,Area>} */
    static areas = new Map();

    /**
     * @param {PhysicsObject} physicsObject
     */
    static addObject(physicsObject) {
        let gridPosition = Area.toGrid(physicsObject.position);
        let area = Area.areas.get(Area.toGridIndex(gridPosition)) || new Area(gridPosition);
        area.members.add(physicsObject);
    }

    /**
     * @param {Vector} position
     * @returns {Vector} position in Area grid
     */
    static toGrid(position) {
        return new Vector(Math.floor(position.x / Area.areaSize), Math.floor(position.y / Area.areaSize));
    }
}