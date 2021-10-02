const { BaseObject } = require("./objectHandler");
const { Vector } = require("./types");
const { UpdateHandler } = require("./updateHandler");

class PhysicsObject extends BaseObject{
    constructor(){
        super();
        this.position = new Vector();
    }
}

exports.PhysicsObject = PhysicsObject;

class Area{
    constructor(){
    }
}