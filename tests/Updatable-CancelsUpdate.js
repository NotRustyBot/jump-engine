const { Updatable, UpdateHandler } = require("../handlers/updateHandler.js");
const { assert } = require("./assert.js");

//prepare
class TestObject {
    update(dt) {
        this.value++;
    }
    constructor() {
        this.value = 0;
        UpdateHandler.register((dt) => this.update(dt), UpdateHandler.layersEnum.control);
    }
}

let testObject = new TestObject();
//test
UpdateHandler.tps = 10;
UpdateHandler.start();

setTimeout(() => {
    UpdateHandler.stop();
    //assert
    assert("Updatable-CancelsUpdate", testObject.value == 1, testObject.value);
}, 110);
