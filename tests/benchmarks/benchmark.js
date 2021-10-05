let benchmark = " \x1b[33m[BENCHMARK]\x1b[0m "

console.log(benchmark+ "preparing enviroment...");

let startTime;
function start() {
    console.log(benchmark + "timer started");
    let temp = process.hrtime();
    startTime = temp[0] + temp[1] / 1000000000;
}

exports.start = start;

function stop() {
    let temp = process.hrtime();
    let stopTime = temp[0] + temp[1] / 1000000000;
    let diff = stopTime - startTime;
    console.log(benchmark + "Completed in \x1b[33m" + (diff*1000).toFixed(3) + "ms\x1b[0m");
}

exports.stop = stop;
