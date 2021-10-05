const { PhysicsObject, Layer } = require("../handlers/physicsHandler");
const { Vector } = require("../handlers/types");
const { assert } = require("./assert");

//prepare
let layer = new Layer();

let testObject = new PhysicsObject();
testObject.position.x = 500;
testObject.position.y = 950;
testObject.size = 100;
testObject.layer = layer;
//test
Layer.addObject(testObject);
let res1 = Layer.getObjects(layer, new Vector(100, 100));
let res2 = Layer.getObjects(layer, new Vector(100, 1100));
let res3 = Layer.getObjects(layer, new Vector(1100, 1100));

//assert
assert("PhysicsObject-Area-SameArea", res1.has(testObject), res1);
assert("PhysicsObject-Area-Nearby", res2.has(testObject), res2);
assert("PhysicsObject-Area-NotElsewhere", !res3.has(testObject), res3);
