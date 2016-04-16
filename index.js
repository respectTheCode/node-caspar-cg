"use strict";

var events = require("events");
var util = require("util");
var _ = require("underscore");
var count = 0;

var ccg = module.exports = function (host, port) {
	events.EventEmitter.call(this);

	this.options = _.extend({}, this.options);

	if (typeof(host) == "string") {
		this.options.host = host;
	} else if (typeof(host) == "object") {
		_.extend(this.options, host);
	}

	if (port) {
		this.options.port = port;
	}

	// osc server
	require("./lib/osc")(this);

	this.index = count++;
};

util.inherits(ccg, events.EventEmitter);

ccg.prototype.options = {
	reconnect: true,
	host: "localhost",
	port: 5250,
	osc: false,
	oscPort: 6250,
	oscThrottle: 250,
	debug: false
};

ccg.prototype.log = function () {
	if (!this.options.debug) return;

	var args = _.values(arguments);
	args.unshift("CCG" + this.index + ":");

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
// mixer commands
require("./lib/mixer")(ccg);
