var events = require("events");
var util = require("util");
var _ = require("underscore");

var ccg = module.exports = function (host, port) {
	events.EventEmitter.call(this);

	if (typeof(address) == "string") {
		this.options.host = host;
	} else if (typeof(host) == "object") {
		_.extend(this.options, host);
	}

	if (port) {
		this.options.port = port;
	}
};

util.inherits(ccg, events.EventEmitter);

ccg.prototype.options = {
	reconnect: true,
	host: "localhost",
	port: 5250,
	debug: false
};

ccg.prototype.log = function () {
	if (!this.options.debug) return;

	var args = _.values(arguments);
	args.unshift("CCG:");

	console.log.apply(console, args);
};

// connection management and command queing
require("./lib/connection")(ccg);
// query commands
require("./lib/query")(ccg);
// query commands
require("./lib/playout")(ccg);
// query data
require("./lib/data")(ccg);
// query templates
require("./lib/template")(ccg);
