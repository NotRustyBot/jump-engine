const { BaseObject, Tag, Tags } = require("../handlers/objectHandler.js");
const { assert } = require("./assert");

//prepare
let customTags = {collisionObject: Tags.collisionObject, test: new Tag() };
class TestObject extends BaseObject {
    constructor() {
        super();
        this.value = 0;
        this.tag(customTags.test);
    }
}

let testObject = new TestObject();

//test
Tag.for([testObject], customTags.test, (e) => {
    e.value++;
});

testObject.untag(customTags.test);

Tag.for([testObject], customTags.test, (e) => {
    e.value++;
});

//assert
assert("BaseObject-TagFilter",testObject.value == 1, testObject.value);
