const { MobileObject } = require("./handlers/physicsHandler");
const { UpdateHandler } = require("./handlers/updateHandler");


class Box extends MobileObject{
    constructor(){
        UpdateHandler.register((dt)=>{
            this.moveUpdate(dt);
        }, UpdateHandler.layersEnum.physics);
    }
}