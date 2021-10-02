class UpdateLayer {
    constructor(id) {
        /**@type {Map<number,Function>} */
        this.subscribers = new Map();
        this.id = id;
        this.index = 0;
    }

    update(dt) {
        this.subscribers.forEach((sub) => {
            sub.func.call(sub.obj);
        });
    }

    register(obj, func) {
        this.subscribers.set(this.index, { obj: obj, func: func });
        this.index++;
    }
}

class UpdateHandler {
    /** @type {UpdateLayer[]} */
    static layers = [];
    static tps = 30;
    static intervalId;
    static lastTick;
    static start() {
        this.lastTick = Date.now();
        this.intervalId = setInterval(() => {
            let dt = Date.now() - this.lastTick;
            this.lastTick = Date.now();
            for (let i = 0; i < this.layers.length; i++) {
                this.layers[i].update(dt);
            }
        }, 1000 / this.tps);
    }
    static stop() {
        clearInterval(this.intervalId);
    }

    static index = 0;

    static AddLayer(id) {
        this.layers.push(new UpdateLayer(id));
        this.layers.sort((a, b) => {
            return a.id - b.id;
        });
    }

    static layersEnum = { control: 0, physics: 1, network: 2 };

    static register(obj, func, layer) {
        this.layers[layer].register(obj, func);
    }
}

exports.UpdateHandler = UpdateHandler;
