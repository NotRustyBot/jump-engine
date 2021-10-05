const { Layer, MobileObject } = require("../../handlers/physicsHandler");
const { Vector } = require("../../handlers/types");
const { start, stop } = require("./benchmark");


let testObject = new MobileObject();
let layer = new Layer();

testObject.position.x = 500;
testObject.position.y = 950;
testObject.setSize(100);
testObject.velocity = new Vector(0, -10);
testObject.layer = layer;
start();

for (let i = 0; i < 1000000; i++) {
    testObject.moveUpdate(-1);
}
stop();