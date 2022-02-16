const { Datagram, AutoView, datatype } = require("../datagram");
const { Vector } = require("../handlers/types");
const { assert } = require("./assert");

//prepare
class NetTest {
    static datagram = new Datagram()
        .addField("int8", datatype.int8)
        .addField("uint8", datatype.uint8)
        .addField("int16", datatype.int16)
        .addField("uint16", datatype.uint16)
        .addField("int32", datatype.int32)
        .addField("uint32", datatype.uint32)
        .addField("int64", datatype.bigInt64)
        .addField("uint64", datatype.bigUint64)
        .addField("float32", datatype.float32)
        .addField("float64", datatype.float64)
        .addField("string", datatype.string)
        .addField("vector32", datatype.vector32)
        .addField("vector64", datatype.vector64)
        .addArray("array", new Datagram().addField("val", datatype.int8));
    constructor() {
        this.int8 = -120;
        this.uint8 = 250;
        this.int16 = -30000;
        this.uint16 = 65000;
        this.int32 = -Math.pow(2, 30);
        this.uint32 = Math.pow(2, 30);
        this.int64 = 2537764290115403777n;
        this.uint64 = 6873995514006732799n;
        this.float32 = 456.4567;
        this.float64 = -Math.pow(2, 20) + 0.123;
        this.string = "12345";
        this.vector32 = new Vector(1, -11);
        this.vector64 = new Vector(1, -Math.pow(2, 20) + 0.123);
        this.array = [{ val: 10 }, { val: 25 }];
    }
}

let testObject = new NetTest();

//test
let view = new AutoView(new ArrayBuffer(300));
NetTest.datagram.serialise(view, testObject);
let viewRead = new AutoView(view.buffer);
let res = NetTest.datagram.deserealise(viewRead);

let arrayTest = true;
for (let i = 0; i < testObject.array.length; i++) {
    if (testObject.array[i].val != res.array[i].val) {
        arrayTest = false;
    }
}

assert(
    "NetworkObject-DataIntegrity-int8",
    testObject.int8 == res.int8,
    "expected " + testObject.int8 + " got " + res.int8
);
assert(
    "NetworkObject-DataIntegrity-uint8",
    testObject.uint8 == res.uint8,
    "expected " + testObject.uint8 + " got " + res.uint8
);
assert(
    "NetworkObject-DataIntegrity-int16",
    testObject.int16 == res.int16,
    "expected " + testObject.int16 + " got " + res.int16
);
assert(
    "NetworkObject-DataIntegrity-uint16",
    testObject.uint16 == res.uint16,
    "expected " + testObject.uint16 + " got " + res.uint16
);
assert(
    "NetworkObject-DataIntegrity-int32",
    testObject.int32 == res.int32,
    "expected " + testObject.int32 + " got " + res.int32
);
assert(
    "NetworkObject-DataIntegrity-uint32",
    testObject.uint32 == res.uint32,
    "expected " + testObject.uint32 + " got " + res.uint32
);
assert(
    "NetworkObject-DataIntegrity-int64",
    testObject.int64 == res.int64,
    "expected " + testObject.int64 + " got " + res.int64
);
assert(
    "NetworkObject-DataIntegrity-uint64",
    testObject.uint64 == res.uint64,
    "expected " + testObject.uint64 + " got " + res.uint64
);
assert(
    "NetworkObject-DataIntegrity-float32",
    testObject.float32.toFixed(3) == res.float32.toFixed(3),
    "expected " + testObject.float32.toFixed(3) + " got " + res.float32.toFixed(3)
);
assert(
    "NetworkObject-DataIntegrity-float64",
    testObject.float64.toFixed(3) == res.float64.toFixed(3),
    "expected " + testObject.float64.toFixed(3) + " got " + res.float64.toFixed(3)
);
assert(
    "NetworkObject-DataIntegrity-vector32",
    testObject.vector32.toString() == res.vector32.toString(),
    "expected " + testObject.vector32.toString() + " got " + res.vector32.toString()
);
assert(
    "NetworkObject-DataIntegrity-vector64",
    testObject.vector64.toString() == res.vector64.toString(),
    "expected " + testObject.vector64.toString() + " got " + res.vector64.toString()
);
assert(
    "NetworkObject-DataIntegrity-string",
    testObject.string == res.string,
    "expected " + testObject.string + " got " + res.string
);
assert(
    "NetworkObject-DataIntegrity-array",
    arrayTest,
    "expected " + testObject.array[1].val + " got " + res.array[1].val
);
