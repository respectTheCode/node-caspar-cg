var events = require("events");
var util = require("util");
var _ = require("underscore");

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

ccg.prototype.options = {
	reconnect: true,
	address: "localhost",
	port: 5250,
	debug: false
};

ccg.prototype.log = function () {
	if (!this.options.debug) return;

	var args = _.values(arguments);
	args.unshift("CCG:");

	console.log.apply(this, args);
};

// connection management and command queing
require("./lib/connection")(ccg);
// query commands
require("./lib/query")(ccg);
// query commands
require("./lib/playout")(ccg);
