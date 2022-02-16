import { Component } from "./component";
import { BaseObject } from "./handlers/objectHandler";
import { Matrix2x2, Vector } from "./handlers/types";

export class PhysicsObject extends Component {
    position: Vector = new Vector();
    layer: Layer;
    inAreas: Set<Area> = new Set();
    rotation: number = 0;
    size: number = 0;
    boundOffsets: Vector[];
    constructor(parent: BaseObject) {
        super(parent);
    }

    init(){
        Layer.addObject(this);
    }

    setSize(size: number) {
        this.size = size;
        this.boundOffsets = [
            new Vector(size, size),
            new Vector(-size, size),
            new Vector(-size, -size),
            new Vector(size, -size),
        ];
    }
}

export class MovingObject extends PhysicsObject{
    velocity: Vector = new Vector();
    constructor(parent: BaseObject) {
        super(parent);
    }
    update(dt: number) {
        if (this.velocity.x + this.velocity.y != 0) {
            let next = this.position.result().add(this.velocity.result().mult(dt));
            Layer.moveObject(this, next);
        }
    }
}

export class CollisionResult {
    hit: boolean;
    overlap: Vector;
    position: Vector;
    object1: PhysicsObject;
    object2: PhysicsObject;
    constructor(hit: boolean, overlap?: Vector, position?: Vector, object1?: PhysicsObject, object2?: PhysicsObject) {
        this.hit = hit;
        this.overlap = overlap;
        this.position = position;
        this.object1 = object1;
        this.object2 = object2;
    }
}

export class Area {
    members: Set<PhysicsObject> = new Set();
    gridPosition: Vector;
    positionIndex: number;
    layer: Layer;
    constructor(layer: Layer, position: Vector) {
        this.gridPosition = new Vector(position.x, position.y);
        this.positionIndex = Layer.toGridIndex(this.gridPosition);
        this.layer = layer;
        layer.areas.set(this.positionIndex, this);
    }

    addObject(physicsObject: PhysicsObject) {
        this.members.add(physicsObject);
        physicsObject.inAreas.add(this);
    }

    static size = 1000;
}

export class HitBox extends Component {
    polygon: Vector[];
    rotated: Vector[];
    size: number;
    physicsObject: PhysicsObject;

    constructor(parent: BaseObject, polygon?: Vector[]) {
        super(parent);
        this.polygon = polygon;
        this.rotated = polygon;
        this.size = 0;
    }

    init(physicsObject: PhysicsObject){
        this.physicsObject = physicsObject;
    }

    //Implementation of GJK algorithm https://www.youtube.com/watch?v=ajv46BSqcK4
    checkCollision(hitbox: HitBox): CollisionResult {
        let center = hitbox.physicsObject.position.diff(this.physicsObject.position); // in standart GJK it si zero
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

        let edges:any[] = []; // [[{Vector}, {Vector}, {number}],...]
        [[0, 1], [1, 2], [2, 0]].forEach(element => { edges.push([simplex[element[0]], simplex[element[1]], Vector.distanceToLine(simplex[element[0]], simplex[element[1]], center)]); });
        //console.log("next phase: " + edges.toString());
        let i = 0; // debug
        while (true) {
            //console.log("edges = " + edges);
            let shortest:any[] = [];
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
                return new CollisionResult(true, translationVect, Vector.add(translationVect, this.physicsObject.position), this.physicsObject, hitbox.physicsObject);
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
    rayCast(from: Vector, to: Vector): boolean | Vector { throw new Error("not implemented");
     }

    /**
     * @param {Vector[]} polygon
     * @returns {number} side of smallest AABB that the polygon can always fit
     */
    static getSize(polygon: Vector[]): number {
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
    rotatePolygon(angle: number) {
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
    _getFurthestPoint(polygon: Vector[], direction: Vector): Vector {
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
    _support(direction: Vector, shape: Vector[]): Vector {
        return this._getFurthestPoint(this.rotated, direction).sub(this._getFurthestPoint(shape, (new Vector(0, 0)).diff(direction)));
    }

}

export class Layer {
    areas: Map<number, Area>;
    constructor() {
        this.areas = new Map();
    }

    static layers: Set<Layer> = new Set();

    static addObject(physicsObject: PhysicsObject) {
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
            gridCoords = new Vector(gridCoords.x - 1, gridCoords.y + 1);
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

    static removeObject(physicsObject: PhysicsObject) {
        for (const area of physicsObject.inAreas) {
            area.members.delete(physicsObject);
        }
        physicsObject.inAreas.clear();
    }

    static getObjects(layer: Layer, position: Vector) {
        let area = layer.areas.get(Layer.toGridIndex(Layer.toGrid(position)));
        if (area == undefined) return new Set();
        return area.members;
    }

    static moveObject(physicsObject: PhysicsObject, position: Vector) {
        const orig = physicsObject.position;
        let updateRequired = false;
        for (let i = 0; i < physicsObject.boundOffsets.length; i++) {
            const vect = physicsObject.boundOffsets[i];
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

    static toGridAxis(scalar: number): number {
        return Math.floor(scalar / Area.size);
    }

    static toGrid(position: Vector): Vector {
        return new Vector(Layer.toGridAxis(position.x), Layer.toGridAxis(position.y));
    }
    
    static toGridIndex(vector: Vector): number {
        return ((vector.x & 0xffff) << 16) | (vector.y & 0xffff);
    }
}
