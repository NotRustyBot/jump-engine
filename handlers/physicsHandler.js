const { BaseObject } = require("./objectHandler");
const { Vector, Matrix2x2 } = require("./types");
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
         * @type {number} `READ ONLY` length of the bounding box
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
}

exports.PhysicsObject = PhysicsObject;

class HitBox {
    /**
     * @param {PhysicsObject} parent
     * @param {Vector[]} polygon
     */
    constructor(parent, polygon) {
        this.polygon = polygon;
        this.rotated = polygon;
        this.size = 0;
        this.parent = parent;
    }

    /**
     * @param {HitBox} hitbox
     * @returns {CollisionResult}
     * Implementation of GJK algorithm https://www.youtube.com/watch?v=ajv46BSqcK4
     */
    checkCollision(hitbox) {
        let center = hitbox.parent.position.diff(this.parent.position); // in standart GJK it si zero
        let direction = center.result();
        let simplex = [this._support(direction.normalize(1), hitbox.rotated)];
        direction = center.diff(simplex[0]);
        //console.log("resoluting collision, center = " + center);

        while (true) {
            let A = this._support(direction.normalize(1), hitbox.rotated);
            //console.log("direction = ", direction.toString());
            //console.log("A = ", A.toString());
            //console.log("center.diff(A) = ", center.diff(A).toString());

            if (Vector.dot(A.diff(center), direction) < 0) {
                //console.log("dot = ", Vector.dot(center.diff(A), direction) + " => exitting");
                return new CollisionResult(false);
            }
            simplex.push(A);
            //console.log("simplex = ", simplex);
            if (simplex.length == 2) {
                direction = Vector.tripleCross(simplex[0], simplex[1], simplex[0]);
                if (direction.length() < 0.0000001)
                    direction = new Vector(-simplex[0].y, simplex[0].x);
                //console.log("new direction from 2 = ", direction.toString());
            } else if (simplex.length == 3) {
                let AB = simplex[1].diff(simplex[2]);
                let AC = simplex[0].diff(simplex[2]);
                let AO = center.diff(simplex[2]);
                let ABcross = Vector.tripleCross(AC, AB, AB);
                let ACcross = Vector.tripleCross(AB, AC, AC);
                if (Vector.dot(ABcross, AO) > 0) {
                    //console.log("first side");
                    simplex = [simplex[1], simplex[2]];
                    direction = ABcross;
                } else if (Vector.dot(ACcross, AO) > 0) {
                    //console.log("second side");
                    simplex = [simplex[0], simplex[2]];
                    direction = ACcross;
                } else {
                    //console.log("FOUND");
                    break; // center found in triangle!
                }
                console.log("new direction from 3 = ", direction.toString());
            } else {
                throw new Error("Honza má chybu v chceckCollision funkci");
            }
        }

        // here ends GJK algorithm and start my algorithm

        let edges = []; // [[{Vector}, {Vector}, {number}],...]
        [[0, 1], [1, 2], [2, 0]].forEach(element => { edges.push([simplex[element[0]], simplex[element[1]], Vector.distanceToLine(simplex[element[0]], simplex[element[1]], center)]); });
        //console.log("next phase: " + edges.toString());
        let i = 0; // debug
        while (true) {
            //console.log("edges = " + edges);
            let shortest = [];
            let mindist = Infinity;
            edges.forEach(edge => {
                if (edge[2] < mindist) {
                    mindist = edge[2];
                    shortest = edge;
                }
            });
            let vec1 = shortest[0].diff(shortest[1]);
            let vec2 = shortest[0].diff(center);
            direction = Vector.tripleCross(vec1, vec2, vec1);
            if (direction.length() < 0.0000001) {
                direction = new Vector(vec1.y, -vec1.x);
                //console.log("new direction from 2 = ", direction.toString());
            }
            let A = this._support(direction.normalize(1), hitbox.rotated);
            // console.log("A = ", A.toString());
            if (Vector.equals(A, shortest[0]) || Vector.equals(A, shortest[1])) {
                let translationVect = direction.normalize(mindist);
                //console.log("suggested tranlsation = " + translationVect);
                return new CollisionResult(true, translationVect, Vector.add(translationVect, this.parent.position), this.parent, hitbox.parent);
            } else {
                let B = shortest[0];
                let C = shortest[1];
                shortest[1] = A;
                shortest[2] = Vector.distanceToLine(B, A, center); // This should update edges array
                edges.push(C, A, Vector.distanceToLine(C, A, center));
            }
            i++; // debug
            if (i > this.polygon.length) { // debug
                throw new Error("Honza má chybu v chceckCollision funkci - zacyklil se");
            }
        }
    }

    /**
     * @param {Vector} from
     * @param {Vector} to
     * @returns {boolean | Vector} false or hit position
     */
    rayCast(from, to) { }

    /**
     * @param {Vector[]} polygon
     * @returns {number} side of smallest AABB that the polygon can always fit
     */
    static getSize(polygon) {
        let max = 0;
        polygon.forEach(vertex => {
            let length = vertex.length();
            max = length > max ? length : max;
        });
        return max;
    }

    /**
     * @param {number} angle
     */
    rotatePolygon(angle) {
        let matrix = Matrix2x2.fromAngle(angle);
        this.rotated = [];
        this.polygon.forEach(vertex => {
            this.rotated.push(matrix.transform(vertex));
        });
    }

    /**
     * @param {Vector[]} polygon
     * @param {Vector} direction can be any nonzero length
     * @return {Vector} furthest point of shape in that direction
     */
    _getFurthestPoint(polygon, direction) {
        let max = 0;
        let result = new Vector(polygon[0].x, polygon[0].y);
        polygon.forEach(vertex => {
            let len = Vector.dot(direction, vertex);
            if (len > max) {
                max = len;
                result = vertex.result();
            }
        });
        return result;
    }

    /**
     * @param {Vector} direction
     * @param {Vector[]} shape
     * @return {Vector} point on simplex in that direction
     */
    _support(direction, shape) {
        return this._getFurthestPoint(this.rotated, direction).sub(this._getFurthestPoint(shape, (new Vector(0, 0)).diff(direction)));
    }

}
exports.HitBox = HitBox;

class CollisionResult {
    /**
     * @param {boolean} hit
     * @param {Vector} overlap
     * @param {Vector} position
     * @param {PhysicsObject} object1
     * @param {PhysicsObject} object2
     */
    constructor(hit, overlap, position, object1, object2) {
        /** @type {boolean} */
        this.hit = hit;
        /** @type {Vector} o tolik budu posouvat objekty*/
        this.overlap = overlap;
        /** @type {Vector} tady budu spawnovat pártikly*/
        this.position = position;
        /** @type {PhysicsObject} parent hitboxu*/
        this.object1 = object1;
        /** @type {PhysicsObject} parent hitboxu*/
        this.object2 = object2;
    }
}

exports.CollisionResult = CollisionResult;

class MobileObject extends PhysicsObject {
    constructor() {
        super();
        this.velocity = new Vector();
        UpdateHandler.register(
            /**@param {Number} dt*/(dt) => {
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
