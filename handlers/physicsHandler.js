const { BaseObject } = require("./objectHandler");
const { Vector } = require("./types");
const { UpdateHandler } = require("./updateHandler");

class PhysicsObject extends BaseObject {
    constructor() {
        super();
        this.position = new Vector();
        /**@type {Layer} */
        this.layer;
        /**@type {Set<Area>} */
        this.inAreas = new Set();
        /** @type {number} */
        this.rotation;
        /**
         * @type {number} READ ONLY length of the bounding box
         */
        this.size = 0;
        this._boundOffsets = [
            new Vector(0, 0),
            new Vector(0, 0),
            new Vector(0, 0),
            new Vector(0, 0),
        ];
    }

    /**
     * @param {number} size
     */
    setSize(size) {
        this.size = size;
        this._boundOffsets = [
            new Vector(size, size),
            new Vector(-size, size),
            new Vector(-size, -size),
            new Vector(size, -size),
        ];
    }

    checkCollision() {}
}

exports.PhysicsObject = PhysicsObject;

class HitBox {
    constructor() {
        /**@type {Shape[]} */
        this.shapes = [];
        this.size = 0;
    }

    /**
     * @param {Shape} shape
     */
    addShape(shape) {
        this.shapes.push(shape);
    }

    /**
     * @param {HitBox} hitbox
     * @param {Vector} relative
     */
    checkCollision(hitbox, relative) {
        if (false) {
            
        }
        for (const shape of this.shapes) {
            for (const other of hitbox.shapes) {
                shape.checkCollision(other);
            }
        }
    }
}

class Shape {
    constructor() {}
    /**
     * @param {Shape} shape
     */
    checkCollision(shape) {}
}

class Line extends Shape {
    constructor(x1, y1, x2, y2) {
        super();
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
    }

    /**
     * @param {Shape} shape
     */
    checkCollision(shape) {
        if (shape instanceof Cicrcle) {
            return LineCircleIntersert(this, shape);
        } else if (shape instanceof Line) {
            return LineLineIntersert(this, shape);
        }
    }
}

class Cicrcle extends Shape {
    constructor(x, y, r) {
        super();
        this.x = x;
        this.y = y;
        this.r = r;
    }

    /**
     * @param {Shape} shape
     */
    checkCollision(shape) {
        if (shape instanceof Cicrcle) {
            return CircleCircleIntersert(shape, this);
        } else if (shape instanceof Line) {
            return LineCircleIntersert(shape, this);
        }
    }
}

/**
 * @param {Line} l1
 * @param {Line} l2
 * @returns {Vector} point of intersection
 */
function LineLineIntersert(l1, l2) {}

/**
 * @param {Line} l
 * @param {Circle} c
 * @returns {Vector} point of intersection
 */
function LineCircleIntersert(l, c) {}

/**
 * @param {Line} c1
 * @param {Line} c2
 * @returns {Vector} point of intersection
 */
function CircleCircleIntersert(c1, c2) {}

class MobileObject extends PhysicsObject {
    constructor() {
        super();
        this.velocity = new Vector();
        UpdateHandler.register(
            /**@param {Number} dt*/ (dt) => {
                this.moveUpdate();
            },
            UpdateHandler.layersEnum.physics
        );
    }
    /**
     * @param {number} dt
     */
    moveUpdate(dt) {
        if (this.velocity.x + this.velocity.y != 0) {
            let next = this.position.result().add(this.velocity.result().mult(dt));
            Layer.moveObject(this, next);
        }
    }
}

exports.MobileObject = MobileObject;

class Area {
    /**
     * @param {Layer} layer
     * @param {Vector} position
     */
    constructor(layer, position) {
        /**@type {Set<PhysicsObject>} */
        this.members = new Set();
        this.gridPosition = new Vector(position.x, position.y);
        this.positionIndex = Layer.toGridIndex(this.gridPosition);
        this.layer = layer;
        layer.areas.set(this.positionIndex, this);
    }

    /**
     * @param {PhysicsObject} physicsObject
     */
    addObject(physicsObject) {
        this.members.add(physicsObject);
        physicsObject.inAreas.add(this);
    }

    static size = 1000;
}
exports.Area = Area;

class Layer {
    constructor() {
        /**@type {Map<number,Area>} */
        this.areas = new Map();
    }

    /**@type {Set<Layer>} */
    static layers = new Set();

    /**
     * @param {PhysicsObject} physicsObject
     */
    static addObject(physicsObject) {
        let layer = physicsObject.layer;
        let gridCoords = Layer.toGrid(physicsObject.position);
        let gridIndex = Layer.toGridIndex(gridCoords);
        let area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
        area.members.add(physicsObject);
        physicsObject.inAreas.add(area);

        let s = physicsObject.size;
        if (s == 0) return;

        let top = false;
        let bottom = false;
        let left = false;
        let right = false;

        let pos = physicsObject.position;
        if (pos.x + s > area.gridPosition.x * Area.size + Area.size) {
            gridIndex = Layer.toGridIndex(new Vector(gridCoords.x + 1, gridCoords.y));
            area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
            area.addObject(physicsObject);
            right = true;
        }
        if (pos.y + s > area.gridPosition.y * Area.size + Area.size) {
            gridCoords = new Vector(gridCoords.x, gridCoords.y + 1);
            gridIndex = Layer.toGridIndex(gridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
            area.addObject(physicsObject);
            top = true;
        }
        if (pos.x - s < area.gridPosition.x * Area.size) {
            gridCoords = new Vector(gridCoords.x - 1, gridCoords.y);
            gridIndex = Layer.toGridIndex(gridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
            area.addObject(physicsObject);
            left = true;
        }
        if (pos.y - s < area.gridPosition.x * Area.size) {
            gridCoords = new Vector(gridCoords.x, gridCoords.y - 1);
            gridIndex = Layer.toGridIndex(gridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
            area.addObject(physicsObject);
            bottom = true;
        }

        //corners

        if (top && right) {
            gridCoords = new Vector(gridCoords.x + 1, gridCoords.y + 1);
            gridIndex = Layer.toGridIndex(gridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
            area.addObject(physicsObject);
        }

        if (top && left) {
            grc = new Vector(gridCoords.x - 1, gridCoords.y + 1);
            gridIndex = Layer.toGridIndex(gridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
            area.addObject(physicsObject);
        }

        if (bottom && right) {
            gridCoords = new Vector(gridCoords.x + 1, gridCoords.y - 1);
            gridIndex = Layer.toGridIndex(gridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
            area.addObject(physicsObject);
        }

        if (bottom && left) {
            gridCoords = new Vector(gridCoords.x - 1, gridCoords.y - 1);
            gridIndex = Layer.toGridIndex(gridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
            area.addObject(physicsObject);
        }
    }

    /**
     * @param {PhysicsObject} physicsObject
     */
    static removeObject(physicsObject) {
        for (const area of physicsObject.inAreas) {
            area.members.delete(physicsObject);
        }
        physicsObject.inAreas.clear();
    }

    /**
     * @param {Layer} layer
     * @param {Vector} position
     * @returns {Set<PhysicsObject>}
     */
    static getObjects(layer, position) {
        let area = layer.areas.get(Layer.toGridIndex(Layer.toGrid(position)));
        if (area == undefined) return new Set();
        return area.members;
    }

    /**
     * @param {PhysicsObject} physicsObject
     * @param {Vector} position
     */
    static moveObject(physicsObject, position) {
        const orig = physicsObject.position;
        let updateRequired = false;
        for (let i = 0; i < physicsObject._boundOffsets.length; i++) {
            const vect = physicsObject._boundOffsets[i];
            if (
                this.toGridAxis(orig.x + vect.x) != this.toGridAxis(position.x + vect.x) ||
                this.toGridAxis(orig.y + vect.y) != this.toGridAxis(position.y + vect.y)
            ) {
                updateRequired = true;
                break;
            }
        }

        if (updateRequired) {
            Layer.removeObject(physicsObject);
            physicsObject.position = position;
            Layer.addObject(physicsObject);
        } else {
            physicsObject.position = position;
        }
    }

    /**
     * @param {number} scalar
     * @returns {number}
     */
    static toGridAxis(scalar) {
        return Math.floor(scalar / Area.size);
    }

    /**
     * @param {Vector} position
     * @returns {Vector} position in Area grid
     */
    static toGrid(position) {
        return new Vector(Layer.toGridAxis(position.x), Layer.toGridAxis(position.y));
    }

    /**
     * @param {Vector} vector
     * @returns {number}
     */
    static toGridIndex(vector) {
        return ((vector.x & 0xffff) << 16) | (vector.y & 0xffff);
    }
}

exports.Layer = Layer;
