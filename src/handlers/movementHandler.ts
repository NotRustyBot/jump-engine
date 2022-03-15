import { Component } from "../component";
import { MovingObject } from "../physics";
import { BaseObject } from "./objectHandler";
import { Vector } from "./types";

export class MovementHandler extends Component {
    powerBonus: number;
    speedBonus: number;
    rotationBonus: number;
    movingObject: MovingObject;
    stats: { enginePower: number; reversePower: number; sidePower: number; speedCap: number; rotationSpeed: number };
    constructor(parent: BaseObject) {
        super(parent);
        this.powerBonus = 1;
        this.speedBonus = 1;
        this.rotationBonus = 1;
    }

    init(
        movingObject: MovingObject,
        stats?: {
            enginePower?: number;
            reversePower?: number;
            sidePower?: number;
            speedCap?: number;
            rotationSpeed?: number;
        }
    ) {
        stats = stats || {};
        this.movingObject = movingObject;
        this.stats = {
            enginePower: stats?.enginePower ?? 100,
            reversePower: stats?.reversePower ?? 50,
            sidePower: stats?.sidePower ?? 25,
            speedCap: stats?.speedCap ?? 1000,
            rotationSpeed: stats?.rotationSpeed ?? 3,
        };
    }

    forward(dt: number, throttle?: number) {
        throttle = throttle || 1;
        let direction = Vector.fromAngle(this.movingObject.rotation);
        this.movingObject.velocity.add(direction.mult(dt * throttle * this.powerBonus));
    }

    backward(dt: number, throttle?: number) {
        throttle = throttle || 1;
        let direction = Vector.fromAngle(this.movingObject.rotation + Math.PI);
        this.movingObject.velocity.add(direction.mult(dt * throttle * this.powerBonus));
    }

    left(dt: number, throttle?: number) {
        throttle = throttle || 1;
        let direction = Vector.fromAngle(this.movingObject.rotation + (Math.PI * 3) / 2);
        this.movingObject.velocity.add(direction.mult(dt * throttle * this.powerBonus));
    }

    right(dt: number, throttle?: number) {
        throttle = throttle || 1;
        let direction = Vector.fromAngle(this.movingObject.rotation + Math.PI / 2);
        this.movingObject.velocity.add(direction.mult(dt * throttle * this.powerBonus));
    }

    clockwise(dt: number, throttle?: number) {
        throttle = throttle || 1;
        this.movingObject.rotation += this.stats.rotationSpeed * dt * throttle * this.rotationBonus;
    }

    anticlockwise(dt: number, throttle?: number) {
        throttle = throttle || 1;
        this.movingObject.rotation -= this.stats.rotationSpeed * dt * throttle * this.rotationBonus;
    }

    cap() {
        if (this.movingObject.velocity.lengthSquared() > Math.pow(this.stats.speedCap * this.speedBonus, 2)) {
            this.movingObject.velocity.normalize(this.stats.speedCap * this.speedBonus);
        }
    }
}
