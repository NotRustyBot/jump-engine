class Vector {
    /**
    *Creates new 2D vector
    * @param {number} x
    * @param {number} y
    */
    constructor(x, y) {
        /**@type {number} X coordinate */
        this.x = x || 0;
        /**@type {number} Y coordinate */
        this.y = y || 0;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    distance(vector) {
        let v = new Vector(Math.abs(this.x - vector.x), Math.abs(this.y - vector.y));
        return v.length();
    }

    add(vector) {
        this.x = this.x + vector.x;
        this.y = this.y + vector.y;
        return this;
    }

    sub(vector) {
        this.x = this.x - vector.x;
        this.y = this.y - vector.y;
        return this;
    }

    /**
     * @param {Vector} vector
     * @return {Vector}
     */
    diff(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    mult(magnitude) {
        this.x = this.x * magnitude;
        this.y = this.y * magnitude;
        return this;
    }

    normalize(length) {
        length = length || 1;
        let total = this.length();
        this.x = (this.x / total) * length;
        this.y = (this.y / total) * length;
        return this;
    }

    toAngle() {
        return Math.atan2(this.y, this.x);
    }

    result() {
        return new Vector(this.x, this.y);
    }

    inbound(bound) {
        return this.x < bound && this.x > -bound && this.y < b3ound && this.y > -bound;
    }

    toString() {
        return "[X: " + this.x.toFixed(3) + " Y: " + this.y.toFixed(3) + "]";
    }

    /**
     * @param {Vector} v1
     * @param {Vector} v2
     * @param {Vector} v3
     * @return {Vector} (v1 x v2) x v3
     */
    static tripleCross(v1, v2, v3) {
        let cross = v1.x * v2.y - v1.y * v2.x;
        return new Vector(-v3.y * cross, v3.x * cross);
    }

    static fromAngle(r) {
        return new Vector(Math.cos(r), Math.sin(r));
    }

    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y)
    }

    /**
     * @param {Vector} v1
     * @param {Vector} v2
     * @returns {Number}
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    /**
     * @param {Vector} A point on line
     * @param {Vector} B point on line
     * @param {Vector} C distanced point
     * @return {number}
     * https://www.youtube.com/watch?v=KHuI9bXZS74
     */
    static distanceToLine(A, B, C) {
        return Math.abs((C.x - A.x) * (-B.y + A.y) + (C.y - A.y) * (B.x - A.x)) /
            Math.sqrt((-B.y + A.y) * (-B.y + A.y) + (B.x - A.x) * (B.x - A.x));
    }

    /**
     * @param {Vector} v1
     * @param {Vector} v2
     * @return {boolean} two vectors have same values
     */
    static equals(v1, v2) {
        return v1.x == v2.x && v1.y == v2.y
    }
}
exports.Vector = Vector;

class Matrix2x2 {
    /**
     * @param {number[][]} values values[row][colum]
     * @returns {Matrix2x2}
     */
    constructor(values) {
        this.values = values;
    }

    /**
     * @param {number} angle
     * @returns {Matrix2x2}
     * create rotation matrix
     */
    static fromAngle(angle) {
        return new Matrix2x2([[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]]);
    }

    /**
     * @param {Vector} vect
     * @return {Vector}
     */
    transform(vect) {
        return new Vector(vect.x * this.values[0][0] + vect.y * this.values[0][1], vect.x * this.values[1][0] + vect.y * this.values[1][1]);
    }
}
exports.Matrix2x2 = Matrix2x2;
