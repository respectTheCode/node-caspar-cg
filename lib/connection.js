"use strict";

var net = require("net");

module.exports = function (ccg) {
	ccg.prototype.connected = false;

	ccg.prototype.client = false;
	ccg.prototype.disconnecting = false;
	ccg.prototype.responseCode = false;
	ccg.prototype.responseMessage = "";
	ccg.prototype.response = "";
	ccg.prototype.readyForNextCommand = true;
	ccg.prototype.waitingForDoubleTerminator = false;
	ccg.prototype.reconnectTimeout = null;

	// ccg.connect
	// -----------
	// Connect to Caspar CG
	//
	// `ccg.connect(host, port[, cb]);`
	//
	// or use `ccg.connect();` after setting `ccg.options`
	ccg.prototype.connect = function (host, port, cb) {
		var self = this;
		self.commandQueue = [];

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

		if (self.options.reconnect && typeof(self.options.reconnectInterval) != "number") {
			self.options.reconnectInterval = 3;
		}

		self.disconnecting = false;

		var client = self.client = net.connect({port: self.options.port, host: self.options.host});



		client.on("connect", function () {
			self.log("Connected to", self.options.host, self.options.port);
			self.connected = true;

			if(self.reconnectTimeout){
				clearInterval(self.reconnectTimeout)
				self.reconnectTimeout = null
			}

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

			self.emit("connectionError", err);

			self.reconnect()
		});

		client.on("reconnecting", function () {
			self.log("Reconnecting");
		});

		client.on("close", function () {
			self.log("Disconnected");
			self.emit("disconnected");
			self.connected = false;

			self.reconnect()
		});

		client.on("data", function (chunk) {
			var commandQueue = self.commandQueue;
			var finishedCommand = function () {
				self.responseCode = false;
				self.responseMessage = "";
				self.response = "";

				if (commandQueue.length > 0) {
					// if there are queued commands send the next one
					self.log("Send:",commandQueue[0].cmd.substr(0, commandQueue[0].cmd.length - 2));
					self.client.write(commandQueue[0].cmd);
				} else {
					// queue is empty we are ready for another command
					self.readyForNextCommand = true;
				}
			};

			self.response += chunk.toString();

			if (!self.responseCode) {
				self.responseCode = parseInt(self.response.substr(0, 3), 10);
				self.log("Response Code:", self.responseCode);
			}

			// if no \r\n then wait for more data
			if (self.response.substr(-2) != "\r\n") return;

			// this fixes the bugged DATA RETRIEVE response
			if (isNaN(self.responseCode)) {
				self.responseCode = 201;
				self.responseMessage = "Response Code is not a number.";
			}

			if (self.responseMessage === "") {
				self.responseMessage = self.response.substr(0, self.response.indexOf("\r\n"));
				self.response = self.response.substr(self.responseMessage.length + 2);
			}

			// 200 needs \r\n\r\n
			if (self.responseCode == 200 && self.response.substr(-4) != "\r\n\r\n") return;

			// strip trailing \r\n
			while (self.response.substr(-2) == "\r\n") {
				self.response = self.response.substr(0, self.response.length - 2);
			}

			// response is complete remove command from queue
			var item = commandQueue.shift();

			if (!item) {
				self.log("ERROR: Not sure what this data is", self.response);
				return;
			}

			var cb = item.cb || false;

			// check for error
			if (
				(self.responseCode >= 400) &&
				(self.responseCode < 600)
			) {
				// callback with error
				if (cb) {
					cb(new Error(self.responseMessage));
				}

				finishedCommand(self);

				return;
			}

			if (cb) {
				if (self.response !== "") {
					cb(null, self.response);
				} else {
					cb(null);
				}
			}

			finishedCommand(self);
		});

		this.reconnect()
	};

	ccg.prototype.reconnect = function () {
		let self = this
		if (!self.disconnecting && self.options.reconnect && !self.reconnectTimeout) {
			self.reconnectTimeout = setInterval(function () {
				self.client.removeAllListeners()
				self.client.end()
				self.client.destroy()
				self.client = false;
				self.emit("reconnecting");
				self.connect();
			}, (self.options.reconnectInterval * 1000));
		}
	}

	// ccg.disconnect
	// --------------
	// Empties command queue and closes connection to Caspar CG
	ccg.prototype.disconnect = function () {
		this.disconnecting = true;
		this.commandQueue = [];

		if (this.client && this.connected) {
			this.client.end();
		}
	};

	// ccg.sendCommand
	// ---------------
	// Sends raw command to CasparCG
	ccg.prototype.sendCommand = function (command, cb) {
		var self = this;
		var commandQueue = self.commandQueue;

		if (typeof(cb) != "function") cb = false;

		// check for connection first
		if (!self.connected) {
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

		if (self.readyForNextCommand) {
			self.readyForNextCommand = false;
			self.log("Send:",commandQueue[0].cmd.substr(0, commandQueue[0].cmd.length - 2));
			self.client.write(commandQueue[0].cmd);
		}
	};
};
