const { BaseObject, Tags, Tag } = require("../../handlers/objectHandler");
const { Vector } = require("../../handlers/types");
const { start, stop } = require("./benchmark");


let testObject = new BaseObject();
testObject.tag(new Tag());
testObject.tag(new Tag());
testObject.tag(new Tag());
testObject.tag(Tags.collisionObject);
testObject.tag(new Tag());
testObject.tag(new Tag());

start();

for (let i = 0; i < 1000000; i++) {
    Tag.filter([testObject],Tags.collisionObject);
}
stop();