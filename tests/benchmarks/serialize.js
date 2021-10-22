const { Datagram, datatype, AutoView } = require("../../handlers/networkHandler");
const { Vector } = require("../../handlers/types");
const { start, stop } = require("./benchmark");

let dg = new Datagram().addField("vec", datatype.vector32);
start();

class Hec{
    constructor(x, y){
        this.x = x || 0;
        this.y = y || 0;
    }
}

let buffer = new ArrayBuffer(100);
let v = new Vector(100, -100);
let aw = new AutoView(buffer);
let out = dg.serialise(aw, { vec: v });
for (let i = 0; i < 1000000; i++) {
    new Vector(100, -100);
    //aw.index = 0;
    //dg.serialise(aw, { vec: v });
    //aw.index = 0;
    //dg.deserealise(aw, out);
}
stop();
