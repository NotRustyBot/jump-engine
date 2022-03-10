class Loop {
    update() {
        let dt = Date.now() - loop.lastTick;
        loop.lastTick = Date.now();
        loop.updateOrder.forEach((func) => {
            func(dt);
        });
        let tickLength = Date.now() - loop.lastTick;
        let timeToNext = 1000 / loop.tps - tickLength;
        setTimeout(loop.update, timeToNext);
    }
    tps: number = 30;
    start(tickrate?: number): void {
        loop.tps = tickrate || loop.tps;
        loop.lastTick = Date.now();
        loop.update();
    }
    lastTick: number;
    updateOrder: Array<(dt: number) => void> = [];
}
export const loop = new Loop();

export class Timer {
    func: Function;
    delay: number;
    time: number;
    repeat: number;
    forever: boolean;
    /**
     * @param {Function} func
     * @param {number} delay
     * @param {number} repeat 0 means forever
     */
    constructor(func: Function, delay: number = 0, repeat: number = 1) {
        this.func = func;
        this.delay = delay;
        this.time = this.delay;
        this.repeat = repeat;
        this.forever = repeat == 0;
    }

    /** @type {Set<Timer>}*/
    static timers: Set<Timer> = new Set();
    static updateTimers(dt: number) {
        for (const timer of Timer.timers) {
            if (timer.time <= 0) {
                timer.repeat--;
                timer.func(dt);
                if (timer.repeat > 0 || timer.forever) {
                    timer.time = timer.delay + timer.time;
                } else {
                    Timer.timers.delete(timer);
                }
            }
            timer.time -= dt;
        }
    }
}
