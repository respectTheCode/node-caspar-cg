var ccg = module.exports = {};

// connection management and command queing
require("./lib/connection")(ccg);
// query commands
require("./lib/query")(ccg);
