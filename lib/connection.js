var net = require("net");

module.exports = function (ccg) {
	ccg.prototype.connected = false;

	var client;
	var disconnecting = false;
	var responseCode = false;
	var responseMessage = "";
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
			self.log("Connected to", self.options.host, self.options.port);
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
	ccg.prototype.sendCommand = function (command, cb) {
		var self = this;

		if (typeof(cb) != "function") cb = false;

		// check for connection first
		if (!this.connected) {
			if (cb) {
				cb(new Error("Not connected"));
			}

			return false;
		}

		if (command.substr(-2) == "\r\n") {
			if (cb) {
				cb(new Error("Invalid command"));
			}

			return false;
		}

		command += "\r\n";

		commandQueue.push({cmd: command, cb: cb});

		if (readyForNextCommand) {
			readyForNextCommand = false;
			self.log("Send:",commandQueue[0].cmd.substr(0, commandQueue[0].cmd.length - 2));
			client.write(commandQueue[0].cmd);
		}
	};

	var finishedCommand = function (self) {
		responseCode = false;
		responseMessage = "";
		response = "";

		if (commandQueue.length > 0) {
			// if there are queue commands send the next one
			self.log("Send:",commandQueue[0].cmd.substr(0, commandQueue[0].cmd.length - 2));
			client.write(commandQueue[0].cmd);
		} else {
			// queue is empty we are ready for another command
			readyForNextCommand = true;
		}
	};

	var onData = function (self) {
		return function (chunk) {
			response += chunk.toString();

			if (!responseCode) {
				responseCode = parseInt(response.substr(0, 3), 10);
				self.log("Response Code:", responseCode);
			}

			// if no \r\n then wait for more data
			if (response.substr(-2) != "\r\n") return;

			// this fixes the bugged DATA RETRIEVE response
			if (isNaN(responseCode)) {
				responseCode = 201;
				responseMessage = "Response Code is not a number.";
			}

			if (responseMessage === "") {
				responseMessage = response.substr(0, response.indexOf("\r\n"));
				response = response.substr(responseMessage.length + 2);
			}

			// 200 needs \r\n\r\n
			if (responseCode == 200 && response.substr(-4) != "\r\n\r\n") return;

			// strip trailing \r\n
			while (response.substr(-2) == "\r\n") {
				response = response.substr(0, response.length - 2);
			}

			// response is complete remove command from queue
			var item = commandQueue.shift();

			if (!item) {
				self.log("ERROR: Not sure what this data is", response);
				return;
			}

			var cb = item.cb || false;

			// check for error
			if (
				(responseCode >= 400) &&
				(responseCode > 600)
			) {
				// callback with error
				if (cb) {
					cb(new Error(responseMessage));
				}

				finishedCommand(self);

				return;
			}

			if (cb) {
				if (response !== "") {
					cb(null, response);
				} else {
					cb(null);
				}
			}

			finishedCommand(self);
		};
	};
};
