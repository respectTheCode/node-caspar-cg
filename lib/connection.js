var net = require("net");
var xml = require("./xml2json");

module.exports = function (ccg) {
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

	// ccg.connect
	// -----------
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

	// ccg.disconnect
	// --------------
	// Empties command queue and closes connection to Caspar CG
	ccg.disconnect = function () {
		disconnecting = true;
		commandQueue = [];

		if (client && ccg.connected) {
			client.end();
		}
	};


	// ccg.sendCommand
	// ---------------
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
				(waitingForDoubleTerminator && response.substr(-4) == "\r\n\r\n") ||
				(!waitingForDoubleTerminator && response.substr(-2) == "\r\n")
			) {
			// remove the terminator
			while (response.substr(-2) == "\r\n") {
				response = response.substr(0, response.length - 2);
			}

			var responseMessage = response.substr(0, response.indexOf("\r\n"));

			// check for error code
			if (responseMessage.substr(0, 1) != "2") {
				console.log("CCG:", responseMessage);
				// callback with error
				if (cb) {
					cb(new Error(responseMessage));
				}
			} else {
				// get the callback
				var item = commandQueue.shift();
				var cb = item[1];

				if (cb) {
					// remove response code and message from response data
					response = response.substr(responseMessage.length + 2);

					// check for XML response
					if (response.substr(0, 1) == "<") {
						response = response.substr(response.indexOf("\n") + 1);
						xml(response, cb);
					} else {
						response = response.split("\n");
						cb(null, response);
					}
				}
			}

			if (commandQueue.length > 0) {
				// if there are queue commands send the next one
				client.write(commandQueue[0][0]);
			} else {
				// queue is empty we are ready for another command
				readyForNextCommand = true;
			}
		}
	};
};
