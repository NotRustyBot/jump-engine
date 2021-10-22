const { MobileObject } = require("./physicsHandler");
const { Vector } = require("./types");

class MovementHandler{
    /**
     * @param {MobileObject} controlee
     */
    constructor(controlee, stats){
        this.parent = controlee;
        this.stats = {enginePower: stats.enginePower || 100, reversePower: stats.reversePower || 50, sidePower: stats.sidePower || 25, speedCap: stats.speedCap || 1000, rotationSpeed = stats.rotationSpeed || 3};

        this.powerBonus = 1;
        this.speedBonus = 1;
        this.rotationBonus = 1;
    }

    forward(dt, throttle){
        throttle = throttle || 1;
        let direction = Vector.fromAngle(this.parent.rotation);
        this.parent.velocity.add(direction.mult(dt*throttle*this.powerBonus));
    }

    backward(dt, throttle){
        throttle = throttle || 1;
        let direction = Vector.fromAngle(this.parent.rotation + Math.PI);
        this.parent.velocity.add(direction.mult(dt*throttle*this.powerBonus));
    }

    left(dt, throttle){
        throttle = throttle || 1;
        let direction = Vector.fromAngle(this.parent.rotation + Math.PI*3/2);
        this.parent.velocity.add(direction.mult(dt*throttle*this.powerBonus));
    }

    right(dt, throttle){
        throttle = throttle || 1;
        let direction = Vector.fromAngle(this.parent.rotation + Math.PI/2);
        this.parent.velocity.add(direction.mult(dt*throttle*this.powerBonus));
    }

    clockwise(dt, throttle){
        throttle = throttle || 1;
        this.parent.rotation += this.stats.rotationSpeed * dt * throttle * this.rotationBonus;
    }

    anticlockwise(dt, throttle){
        throttle = throttle || 1;
        this.parent.rotation -= this.stats.rotationSpeed * dt * throttle * this.rotationBonus;
    }

    cap(){
        if (this.parent.velocity.lengthSquared() > Math.pow(this.stats.speedCap*this.speedBonus,2)) {
            this.parent.velocity.normalize(this.stats.speedCap * this.speedBonus);
        }
    }
}

exports.MovementHandler = MovementHandler;