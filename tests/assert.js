let pass = 0;
let fail = 0;
function testStats(){
    console.log("runs: \x1b[32m"+ pass + "\x1b[0m, fails: \x1b[31m" + fail +"\x1b[0m");
}
exports.testStats = testStats;

/**
 * @param {string} testName
 * @param {boolean} condition
 */
function assert(testName, condition) {
    if (condition) {
        console.log("\x1b[32m\x1b[1m%s\x1b[0m "+testName, " [PASSED] ");
        pass++;
    }else{
        console.log("\x1b[31m\x1b[1m%s\x1b[0m "+testName, " [FAILED] ");
        console.log( new Error().stack.split("\n")[2]);
        fail++;
    }
}

exports.assert = assert;