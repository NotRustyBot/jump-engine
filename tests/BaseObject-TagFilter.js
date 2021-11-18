const { BaseObject, Tag } = require("../handlers/objectHandler.js");
const { assert } = require("./assert");

//prepare
let Tags = { test: new Tag() };
class TestObject extends BaseObject {
    constructor() {
        super();
        this.value = 0;
        this.tag(Tags.test);
    }
}

let testObject = new TestObject();

//test
Tag.for([testObject], Tags.test, (e) => {
    e.value++;
});

testObject.untag(Tags.test);

Tag.for([testObject], Tags.test, (e) => {
    e.value++;
});

//assert
assert("BaseObject-TagFilter", testObject.value == 1, testObject.value);
