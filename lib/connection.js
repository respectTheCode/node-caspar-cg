var net = require("net");
var xml = require("./xml2json");

module.exports = function (ccg) {
	ccg.prototype.connected = false;

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
	ccg.prototype.connect = function (host, port, cb) {
		var self = this;

		if (typeof(host) != "string") {
			cb = port;
			port = host;
			host = false;
		}

		if (typeof(port) != "number") {
			cb = port;
			port = false;
		}

		if (typeof(cb) != "function") cb = false;

		if (host) self.options.host = host;
		if (port) self.options.port = port;

		disconnecting = false;

		client = net.connect({port: self.options.port, host: self.options.host});

		client.on("connect", function () {
			self.log("Connected to", self.options.address, self.options.port);
			self.connected = true;

			if (cb) {
				cb();
				cb = false;
			}

			self.emit("connected");
		});

		client.on("error", function (err) {
			if (cb) {
				cb(err);
			}

			self.emit("error", err);
		});

		client.on("data", onData(self));

		client.on("end", function () {
			self.log("Discconnected");
			self.emit("discconnected");
			self.connected = false;
			client = false;

			if (!disconnecting && self.options.reconnect) {
				self.connect();
			}
		});
	};

	// ccg.disconnect
	// --------------
	// Empties command queue and closes connection to Caspar CG
	ccg.prototype.disconnect = function () {
		disconnecting = true;
		commandQueue = [];

		if (client && this.connected) {
			client.end();
		}
	};


	// ccg.sendCommand
	// ---------------
	// Sends raw command to CasparCG
	ccg.prototype.sendCommand = function (command, doubleTerminator, cb) {
		if (!cb && typeof(doubleTerminator) == "function") {
			cb = doubleTerminator;
			doubleTerminator = false;
		}

		if (typeof(cb) != "function") cb = false;

		// check for connection first
		if (!this.connected) {
			if (cb) {
				cb(new Error("Not connected"));
			}

			return false;
		}

		if (command.substr(-2) != "\r\n") command += "\r\n";

		commandQueue.push([command, cb || false, doubleTerminator]);

		if (readyForNextCommand) {
			readyForNextCommand = false;
			client.write(commandQueue[0][0]);
		}
	};

	var onData = function (self) {
		return function (chunk) {
			response += chunk.toString();

			// check for complete response before doing anything
			if (
					(commandQueue[0][2] && response.substr(-4) == "\r\n\r\n") ||
					(!commandQueue[0][2] && response.substr(-2) == "\r\n")
				) {
				// response is complete remove command from queue
				var item = commandQueue.shift();
				var cb = item[1];

				// remove the terminator
				while (response.substr(-2) == "\r\n") {
					response = response.substr(0, response.length - 2);
				}

				var responseMessage = response.substr(0, response.indexOf("\r\n"));

				if (responseMessage == "") responseMessage = response;

				self.log(responseMessage);

				// check for error code
				if (responseMessage.substr(0, 1) != "2") {
					// callback with error
					if (cb) {
						cb(new Error(response));
					}
				} else {
					if (cb) {
						// remove response code and message from response data
						response = response.substr(responseMessage.length + 2);

						// check for XML response
						if (response.substr(0, 1) == "<") {
							response = response.substr(response.indexOf("\n") + 1);
							xml(response, cb);
						} else {
							if (response == "") {
								cb();
							} else {
								response = response.split("\r\n");
								cb(null, response);
							}
						}
					}
				}

				response = "";
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
};
