import { Vector } from "./handlers/types";

export enum datatype {
    int8 = 0,
    uint8 = 1,
    int16 = 2,
    uint16 = 3,
    int32 = 4,
    uint32 = 5,
    bigInt64 = 6,
    bigUint64 = 7,
    float32 = 8,
    float64 = 9,
    string = 10,
    vector32 = 11,
    vector64 = 12,
    array = 13,
}

export class Datagram {
    static index = 0;
    static datagrams: Map<number, Datagram> = new Map();
    names: string[];
    types: datatype[];
    datagrams: Map<number, Datagram> = new Map();
    constructor() {
        this.names = [];
        this.types = [];
    }

    addField(name: string, type: datatype): Datagram {
        this.names.push(name);
        this.types.push(type);
        return this;
    }

    addArray(name: string, datagram: Datagram) {
        this.datagrams.set(this.names.length, datagram);
        this.names.push(name);
        this.types.push(datatype.array);
        return this;
    }

    serialise(view: AutoView, obj: any) {
        for (let i = 0; i < this.names.length; i++) {
            const field = this.names[i];
            view.setValue[this.types[i]](obj[field], this.datagrams.get(i));
        }
    }

    /**
     * @param {AutoView} view
     * @param {any} [obj]
     * @returns {any} same as input, if supplied.
     */
    deserealise(view: AutoView, obj?: any): any {
        let out = obj || {};
        for (let i = 0; i < this.names.length; i++) {
            const field = this.names[i];
            out[field] = view.getValue[this.types[i]](this.datagrams.get(i));
        }

        return out;
    }
}

export class AutoView extends DataView {
    index: number;
    constructor(buffer: ArrayBuffer) {
        super(buffer);
        this.index = 0;
    }

    /**
     * @param {string} value
     */
    setString(offset: number, value: string) {
        this.setUint16(offset, value.length);
        offset += 2;
        for (let i = 0; i < value.length; i++) {
            this.setUint16(offset, value.charCodeAt(i));
            offset += 2;
        }
    }

    setArray(offset: number, value: Array<object>, datagram: Datagram) {
        let tempindex = this.index;
        this.index = offset;
        this.writeArray(value, datagram);
        this.index = tempindex;
    }

    setVector32(offset: number, value: Vector) {
        this.setFloat32(offset, value.x);
        offset += 4;
        this.setFloat32(offset, value.y);
    }
    setVector64(offset: number, value: Vector) {
        this.setFloat64(offset, value.x);
        offset += 4;
        this.setFloat64(offset, value.y);
    }

    getString(offset: number) {
        let length = this.getUint16(offset);
        offset += 2;
        let array = [];
        for (let i = 0; i < length; i++) {
            array[i] = String.fromCharCode(this.getUint16(offset));
            offset += 2;
        }
        return array.join("");
    }

    getArray(offset: number, datagram: Datagram): object[] {
        let out: object[];
        let tempindex = this.index;
        this.index = offset;
        out = this.readArray(datagram);
        return out;
    }

    getVector32(offset: number): Vector {
        return new Vector(this.getFloat32(offset), this.getFloat32(offset + 4));
    }

    getVector64(offset: number): Vector {
        return new Vector(this.getFloat64(offset), this.getFloat64(offset + 4));
    }

    readInt8(): number {
        let out = this.getInt8(this.index);
        this.index += 1;
        return out;
    }
    readUint8(): number {
        let out = this.getUint8(this.index);
        this.index += 1;
        return out;
    }
    readInt16(): number {
        let out = this.getInt16(this.index);
        this.index += 2;
        return out;
    }
    readUint16(): number {
        let out = this.getUint16(this.index);
        this.index += 2;
        return out;
    }
    readInt32(): number {
        let out = this.getInt32(this.index);
        this.index += 4;
        return out;
    }
    readUint32(): number {
        let out = this.getUint32(this.index);
        this.index += 4;
        return out;
    }
    readFloat32(): number {
        let out = this.getFloat32(this.index);
        this.index += 4;
        return out;
    }
    readBigInt64(): bigint {
        let out = this.getBigInt64(this.index);
        this.index += 8;
        return out;
    }
    readBigUint64(): bigint {
        let out = this.getBigUint64(this.index);
        this.index += 8;
        return out;
    }
    readFloat64(): number {
        let out = this.getFloat64(this.index);
        this.index += 8;
        return out;
    }
    readString(): string {
        let out = this.getString(this.index);
        this.index += 2 + out.length * 2;
        return out;
    }

    readVector32(): Vector {
        let out = this.getVector32(this.index);
        this.index += 8;
        return out;
    }

    readVector64(): Vector {
        let out = this.getVector64(this.index);
        this.index += 16;
        return out;
    }

    readArray(datagram: Datagram): object[] {
        let out = [];
        let length = this.readUint32();
        for (let i = 0; i < length; i++) {
            out.push(datagram.deserealise(this));
        }
        return out;
    }

    writeInt8(value: number) {
        this.setInt8(this.index, value);
        this.index += 1;
    }
    writeUint8(value: number) {
        this.setUint8(this.index, value);
        this.index += 1;
    }
    writeInt16(value: number) {
        this.setInt16(this.index, value);
        this.index += 2;
    }
    writeUint16(value: number) {
        this.setUint16(this.index, value);
        this.index += 2;
    }
    writeInt32(value: number) {
        this.setInt32(this.index, value);
        this.index += 4;
    }
    writeUint32(value: number) {
        this.setUint32(this.index, value);
        this.index += 4;
    }
    writeFloat32(value: number) {
        this.setFloat32(this.index, value);
        this.index += 4;
    }
    writeBigInt64(value: bigint) {
        this.setBigInt64(this.index, value);
        this.index += 8;
    }
    writeBigUint64(value: bigint) {
        this.setBigUint64(this.index, value);
        this.index += 8;
    }
    writeFloat64(value: number) {
        this.setFloat64(this.index, value);
        this.index += 8;
    }
    writeString(value: string) {
        this.setString(this.index, value);
        this.index += 2 + value.length * 2;
    }
    writeVector32(value: Vector) {
        this.setVector32(this.index, value);
        this.index += 8;
    }
    writeVector64(value: Vector) {
        this.setVector64(this.index, value);
        this.index += 16;
    }
    /**
     * @param {ArrayLike<object>} value
     * @param {Datagram} datagram
     */
    writeArray(value: Array<object>, datagram: Datagram) {
        this.writeUint32(value.length);
        for (const obj of value) {
            datagram.serialise(this, obj);
        }
    }

    setValue: Array<(value: any, datagram?: Datagram) => void> = [
        (value: number) => {
            this.writeInt8(value);
        },
        (value: number) => {
            this.writeUint8(value);
        },
        (value: number) => {
            this.writeInt16(value);
        },
        (value: number) => {
            this.writeUint16(value);
        },
        (value: number) => {
            this.writeInt32(value);
        },
        (value: number) => {
            this.writeUint32(value);
        },
        (value: bigint) => {
            this.writeBigInt64(value);
        },
        (value: bigint) => {
            this.writeBigUint64(value);
        },
        (value: number) => {
            this.writeFloat32(value);
        },
        (value: number) => {
            this.writeFloat64(value);
        },
        (value: string) => {
            this.writeString(value);
        },
        (value: Vector) => {
            this.writeVector32(value);
        },
        (value: Vector) => {
            this.writeVector64(value);
        },
        (value: Array<any>, datagram?: Datagram) => {
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
        (datagram: Datagram) => {
            return this.readArray(datagram);
        },
    ];
}
