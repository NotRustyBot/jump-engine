const { testStats } = require("./assert");

console.log("Running all tests");

require("./Updatable-RecvivesUpdate");
setTimeout(() => {
    require("./Updatable-CancelsUpdate");
    setTimeout(() => {
        require("./BaseObject-TagFilter");
        testStats();
        process.exit();
    }, 200);
}, 200);
