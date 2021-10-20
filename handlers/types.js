class Vector {
    /**@type {number} X coordinate */
    x;
    /**@type {number} Y coordinate */
    y;
    /**
     *Creates new 2D vector
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthSquared(){
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

    static fromAngle(r) {
        return new Vector(Math.cos(r), Math.sin(r));
    }

    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
}

Vector.prototype.toString = function(){
    return "[X: " +this.x.toFixed(3)+ " Y: " + this.y.toFixed(3) + "]";
}

exports.Vector = Vector;
