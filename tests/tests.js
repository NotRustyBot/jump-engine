const { testStats } = require("./assert");

console.log("Running all tests");

require("./BaseObject-TagFilter");
require("./PhysicsObject-Area");
require("./MobileObject-Move");
require("./NetworkObject-DataIntegrity");
testStats();
process.exit();