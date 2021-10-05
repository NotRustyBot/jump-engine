const { MobileObject, Layer } = require("../handlers/physicsHandler");
const { Vector } = require("../handlers/types");
const { assert } = require("./assert");

//prepare
let layer = new Layer();

let testObject = new MobileObject();
testObject.position.x = 500;
testObject.position.y = 950;
testObject.setSize(100);
testObject.velocity = new Vector(0, -100);
testObject.layer = layer;
//test
Layer.addObject(testObject);
let res1 = Layer.getObjects(layer, new Vector(100, 100)).has(testObject);
let res2 = Layer.getObjects(layer, new Vector(100, 1100)).has(testObject);
testObject.moveUpdate(1);
let res3 = Layer.getObjects(layer, new Vector(100, 1100)).has(testObject);

//assert
assert("MobileObject-Move-SameArea", res1, res1);
assert("MobileObject-Move-Nearby", res2, res2);
assert("MobileObject-Move-RemovedNearby", !res3, res3);
