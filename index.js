var events = require("events");
var util = require("util");

var ccg = module.exports = function (address, port) {
	events.EventEmitter.call(this);

	if (typeof(address) == "string") {
		this.options.address = address;
	} else if (typeof(address) == "object") {
		this.options = address;
	}

	if (port) {
		this.options.port = port;
	}
};

util.inherits(ccg, events.EventEmitter);

// connection management and command queing
require("./lib/connection")(ccg);
// query commands
require("./lib/query")(ccg);
