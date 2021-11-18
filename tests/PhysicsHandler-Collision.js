const { PhysicsObject, HitBox } = require("../handlers/physicsHandler");
const { Vector } = require("../handlers/types");
const { assert } = require("./assert");

class Colideable extends PhysicsObject{
    constructor(){
        super();
        /**@type {HitBox} */
        this.hitbox;
    }
}

let obj1 = new Colideable();
obj1.position = new Vector(100,100);
obj1.setSize(10);
obj1.hitbox = new HitBox(obj1, [new Vector(5,0), new Vector(0,5), new Vector(-5,0), new Vector(0,-5)]);

let obj2 = new Colideable();
obj2.position = new Vector(107,100);
obj2.setSize(10);
obj2.hitbox = new HitBox(obj2, [new Vector(5,0), new Vector(0,5), new Vector(-5,0), new Vector(0,-5)]);

let result = obj1.hitbox.checkCollision(obj2.hitbox);

assert("PhysicsHandler-Collision-resultHit", result.hit, "Expected true, got: " + result.hit);
assert("PhysicsHandler-Collision-overlap", result.overlap.toString() == new Vector(3,0), result);
assert("PhysicsHandler-Collision-overlap", result.position.y == 100 && (result.position.x).toFixed(2) == (result.overlap.x+100).toFixed(2), result);
assert("PhysicsHandler-Collision-object1", result.object1 == obj1, result);
assert("PhysicsHandler-Collision-object2", result.object2 == obj2, result);

