const { testStats } = require("./assert");

console.log("Running all tests");

require("./Updatable-RecvivesUpdate");
setTimeout(() => {
    require("./Updatable-CancelsUpdate");
    setTimeout(() => {
        require("./BaseObject-TagFilter");
        require("./PhysicsObject-Area");
        require("./MobileObject-Move");
        testStats();
        process.exit();
    }, 200);
}, 200);
