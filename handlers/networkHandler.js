/**@typedef {number} types */

const { Vector } = require("./types");

/**@enum {types} */
let datatype = {
    int8: 0,
    uint8: 1,
    int16: 2,
    uint16: 3,
    int32: 4,
    uint32: 5,
    bigInt64: 6,
    bigUint64: 7,
    float32: 8,
    float64: 9,
    string: 10,
    vector32: 11,
    vector64: 12,
    array: 13,
};
exports.datatype = datatype;

class Datagram {
    static index = 0;
    /**@type {Map<number,Datagram>} */
    static datagrams = new Map();
    constructor() {
        this.names = [];
        this.types = [];
        /**@type {Map<number,Datagram>} */
        this.datagrams = new Map();
    }

    /**
     * @param {string} name
     * @param {types} type
     * @returns {Datagram} this
     */
    addField(name, type) {
        this.names.push(name);
        this.types.push(type);
        return this;
    }

    addArray(name, datagram){
        this.datagrams.set(this.names.length, datagram)
        this.names.push(name);
        this.types.push(datatype.array);
        return this;
    }
    

    /**
     * @param {AutoView} view
     * @param obj
     */
    serialise(view, obj) {
        for (let i = 0; i < this.names.length; i++) {
            const field = this.names[i];
            view.setValue[this.types[i]](obj[field], this.datagrams.get(i));
        }
    }

    /**
     * @param {AutoView} view
     * @param {object} [obj]
     * @returns {object} same as input, if supplied.
     */
    deserealise(view, obj) {
        let out = obj || {};
        for (let i = 0; i < this.names.length; i++) {
            const field = this.names[i];
            out[field] = view.getValue[this.types[i]](this.datagrams.get(i));
        }

        return out;
    }
}

exports.Datagram = Datagram;

class AutoView extends DataView {
    /**@param {ArrayBufferLike} buffer */
    constructor(buffer) {
        super(buffer);
        this.index = 0;
    }

    /**
     * @param {string} value
     */
    setString(offset, value) {
        this.setUint16(offset, value.length);
        offset += 2;
        for (let i = 0; i < value.length; i++) {
            this.setUint16(offset, value.charCodeAt(i));
            offset += 2;
        }
    }

    /**
     * @param {number} offset
     * @param {ArrayLike<object>} value
     * @param {Datagram} datagram
     */
    setArray(offset, value, datagram) {
        let tempindex = this.index;
        this.index = offset;
        this.writeArray(value, datagram);
        this.index = tempindex;
    }

    setVector32(offset, value) {
        this.setFloat32(offset, value.x);
        offset += 4;
        this.setFloat32(offset, value.y);
    }
    setVector64(offset, value) {
        this.setFloat64(offset, value.x);
        offset += 4;
        this.setFloat64(offset, value.y);
    }

    getString(offset) {
        let length = this.getUint16(offset);
        offset += 2;
        let array = [];
        for (let i = 0; i < length; i++) {
            array[i] = String.fromCharCode(this.getUint16(offset));
            offset += 2;
        }
        return array.join("");
    }

    /**
     * @param {number} offset
     * @param {Datagram} datagram
     * @returns {object[]}
     */
    getArray(offset, datagram) {
        let out;
        let tempindex = this.index;
        this.index = offset;
        out = this.readArray(datagram);
        return out;
    }

    getVector32(offset) {
        return new Vector(this.getFloat32(offset), this.getFloat32(offset + 4));
    }

    getVector64(offset) {
        return new Vector(this.getFloat64(offset), this.getFloat64(offset + 4));
    }

    readInt8() {
        let out = this.getInt8(this.index);
        this.index += 1;
        return out;
    }
    readUint8() {
        let out = this.getUint8(this.index);
        this.index += 1;
        return out;
    }
    readInt16() {
        let out = this.getInt16(this.index);
        this.index += 2;
        return out;
    }
    readUint16() {
        let out = this.getUint16(this.index);
        this.index += 2;
        return out;
    }
    readInt32() {
        let out = this.getInt32(this.index);
        this.index += 4;
        return out;
    }
    readUint32() {
        let out = this.getUint32(this.index);
        this.index += 4;
        return out;
    }
    readFloat32() {
        let out = this.getFloat32(this.index);
        this.index += 4;
        return out;
    }
    readBigInt64() {
        let out = this.getBigInt64(this.index);
        this.index += 8;
        return out;
    }
    readBigUint64() {
        let out = this.getBigUint64(this.index);
        this.index += 8;
        return out;
    }
    readFloat64() {
        let out = this.getFloat64(this.index);
        this.index += 8;
        return out;
    }
    readString() {
        let out = this.getString(this.index);
        this.index += 2 + out.length * 2;
        return out;
    }

    readVector32() {
        let out = this.getVector32(this.index);
        this.index += 8;
        return out;
    }

    readVector64() {
        let out = this.getVector64(this.index);
        this.index += 16;
        return out;
    }

    /**
     * @param {Datagram} datagram
     * @returns {object[]}
     */
    readArray(datagram) {
        let out = [];
        let length = this.readUint32();
        for (let i = 0; i < length; i++) {
            out.push(datagram.deserealise(this));
        }
        return out;
    }

    writeInt8(value) {
        this.setInt8(this.index, value);
        this.index += 1;
    }
    writeUint8(value) {
        this.setUint8(this.index, value);
        this.index += 1;
    }
    writeInt16(value) {
        this.setInt16(this.index, value);
        this.index += 2;
    }
    writeUint16(value) {
        this.setUint16(this.index, value);
        this.index += 2;
    }
    writeInt32(value) {
        this.setInt32(this.index, value);
        this.index += 4;
    }
    writeUint32(value) {
        this.setUint32(this.index, value);
        this.index += 4;
    }
    writeFloat32(value) {
        this.setFloat32(this.index, value);
        this.index += 4;
    }
    writeBigInt64(value) {
        this.setBigInt64(this.index, value);
        this.index += 8;
    }
    writeBigUint64(value) {
        this.setBigUint64(this.index, value);
        this.index += 8;
    }
    writeFloat64(value) {
        this.setFloat64(this.index, value);
        this.index += 8;
    }
    writeString(value) {
        this.setString(this.index, value);
        this.index += 2 + value.length * 2;
    }
    writeVector32(value) {
        this.setVector32(this.index, value);
        this.index += 8;
    }
    writeVector64(value) {
        this.setVector64(this.index, value);
        this.index += 16;
    }
    /**
     * @param {ArrayLike<object>} value
     * @param {Datagram} datagram
     */
    writeArray(value, datagram) {
        this.writeUint32(value.length);
        for (const obj of value) {
            datagram.serialise(this, obj);
        }
    }

    setValue = [
        (value) => {
            this.writeInt8(value);
        },
        (value) => {
            this.writeUint8(value);
        },
        (value) => {
            this.writeInt16(value);
        },
        (value) => {
            this.writeUint16(value);
        },
        (value) => {
            this.writeInt32(value);
        },
        (value) => {
            this.writeUint32(value);
        },
        (value) => {
            this.writeBigInt64(value);
        },
        (value) => {
            this.writeBigUint64(value);
        },
        (value) => {
            this.writeFloat32(value);
        },
        (value) => {
            this.writeFloat64(value);
        },
        (value) => {
            this.writeString(value);
        },
        (value) => {
            this.writeVector32(value);
        },
        (value) => {
            this.writeVector64(value);
        },
        (value, datagram) => {
            this.writeArray(value, datagram);
        },
    ];

    getValue = [
        () => {
            return this.readInt8();
        },
        () => {
            return this.readUint8();
        },
        () => {
            return this.readInt16();
        },
        () => {
            return this.readUint16();
        },
        () => {
            return this.readInt32();
        },
        () => {
            return this.readUint32();
        },
        () => {
            return this.readBigInt64();
        },
        () => {
            return this.readBigUint64();
        },
        () => {
            return this.readFloat32();
        },
        () => {
            return this.readFloat64();
        },
        () => {
            return this.readString();
        },
        () => {
            return this.readVector32();
        },
        () => {
            return this.readVector64();
        },
        (datagram) => {
            return this.readArray(datagram);
        },
    ];
}
exports.AutoView = AutoView;

class Scheme {
    constructor() {
        /** @type {Map<number,Datagram>} */
        this.stages = new Map();
    }

    /**
     * @param {number} id
     * @param {Datagram} datagram
     */
    addStage(id, datagram) {
        this.stages.set(id, datagram);
    }
}
