var net = require("net");

var ccg = module.exports = {};
ccg.connected = false;
ccg.options = {
	reconnect: true,
	address: "localhost",
	port: 5250
};

var client;
var disconnecting = false;
var response = "";
var readyForNextCommand = true;
var waitingForDoubleTerminator = false;

// Queue of commands and callbacks that haven't completed yet
var commandQueue = [];

// connect
// -------
// Connect to Caspar CG
//
// `ccg.connect(host, port[, cb]);`
//
// or use `ccg.connect();` after setting `ccg.options`
ccg.connect = function (host, port, cb) {
	if (host && port) {
		ccg.options.host = host;
		ccg.option.port = port;
	} else if (!port && !cb) {
		cb = host;
	} else {
		return false;
	}

	disconnecting = false;

	client = net.connect({port: ccg.options.port, host: ccg.options.host}, function () {
		console.log("CCG: Connected to", ccg.options.address, ccg.options.port);
		ccg.connected = true;

		if (cb) {
			cb();
		}
	});

	client.on("data", onData);

	client.on("end", function () {
		console.log("CCG: Discconnected");
		ccg.connected = false;
		client = false;

		if (!disconnecting && ccg.options.reconnect) {
			ccg.connect();
		}
	});
};

// disconnect
// ----------
// Empties command queue and closes connection to Caspar CG
ccg.disconnect = function () {
	disconnecting = true;
	commandQueue = [];

	if (client && ccg.connected) {
		client.end();
	}
};


// sendCommand
// -----------
// Sends raw command to CasparCG
ccg.sendCommand = function (command, cb) {
	// check for connection first
	if (!ccg.connected) return false;

	if (command.substr(-2) != "\r\n") command += "\r\n";

	if (readyForNextCommand) {
		readyForNextCommand = false;
		client.write(command);
	}

	commandQueue.push([command, cb || false]);
};

var onData = function (chunk) {
	response += chunk.toString();

	// check for complete response before doing anything
	if (
			(!waitingForDoubleTerminator && response.indexOf("\r\n") > -1) ||
			(waitingForDoubleTerminator && response.indexOf("\r\n\r\n") > -1)
		) {
		// remove the terminator
		if (waitingForDoubleTerminator) {
			response = response.substr(response.indexOf("\r\n\r\n"));
		} else {
			response = response.substr(response.indexOf("\r\n"));
		}

		// get the callback
		var item = commandQueue.shift();
		var cb = item[1];

		if (cb) cb(null, response);

		if (commandQueue.length > 0) {
			client.write(commandQueue[0][0]);
		} else {
			readyForNextCommand = true;
		}
	}
};


// info
// ----
//
// INFO ([channel:int]{-[layer:int]}|TEMPLATE [filename:string])
ccg.info = function (channel, layer, cb) {
	// check for connection first
	if (!ccg.connected) return false;

	var command = "INFO";
	
	if (!cb && typeof(layer) == "function") {
		cb = layer;
		layer = false;
	}

	if (!cb && !layer && typeof(channel) == "function") {
		cb = channel;
		layer = false;
		channel = false;
	}

	if (channel) command += " " + channel;
	if (layer) command += "-" + layer;

	ccg.sendCommand(command, cb);
};

