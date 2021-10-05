class UpdateLayer {
    constructor(id) {
        /**@type {Map<number,Function>} */
        this.subscribers = new Map();
        this.id = id;
        this.index = 0;
    }

    update(dt) {
        this.subscribers.forEach((subscriber) => {
            subscriber(dt);
        });
    }

    register(func) {
        this.subscribers.set(this.index, func);
        this.index++;
    }
}

class UpdateHandler {
    /** @type {Map<number,UpdateLayer>} */
    static layers = new Map();
    static tps = 30;
    static intervalId;
    static lastTick;
    static start() {
        this.lastTick = Date.now();
        this.intervalId = setInterval(() => {
            let dt = Date.now() - this.lastTick;
            this.lastTick = Date.now();
            this.layers.forEach((l)=> l.update(dt))
        }, 1000 / this.tps);
    }
    static stop() {
        clearInterval(this.intervalId);
    }

    static index = 0;

    static AddLayer(id) {
        this.layers.set(id, new UpdateLayer(id));
    }

    static layersEnum = { control: 0, physics: 1, network: 2 };

    /**
     * @param {Function} func
     * @param {number} layer
     */
    static register(func, layer) {
        if (this.layers.get(layer)== undefined) {
            this.AddLayer(layer);
        }
        this.layers.get(layer).register(func);
    }
}

exports.UpdateHandler = UpdateHandler;
