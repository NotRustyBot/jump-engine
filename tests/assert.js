let pass = 0;
let fail = 0;
function testStats(){
    console.log("passed: \x1b[32m"+ pass + "\x1b[0m, failed: \x1b[31m" + fail +"\x1b[0m");
}
exports.testStats = testStats;

/**
 * @param {string} testName
 * @param {boolean} condition
 */
function assert(testName, condition, printOnError, serial) {
    if (condition) {
        console.log("\x1b[32m\x1b[1m%s\x1b[0m "+testName, " [PASSED] ");
        pass++;
    }else{
        console.log("\x1b[31m\x1b[1m%s\x1b[0m "+testName, " [FAILED] ");
        console.log(new Error().stack.split("\n")[2]);
        console.log(printOnError);
        fail++;
    }
}

exports.assert = assert;