"use strict";

module.exports = function (ccg) {
	var sendPlayoutCommand = function (self, cmd, channel, file, options, cb) {
		if (typeof(channel) == "number") {
			channel = channel.toString();
		}

		if (typeof(channel) != "string" || !/[0-9]+-[0-9]+/.test(channel)) {
			self.log("Invalid channel");
			return cb && cb(new Error("Invalid channel"));
		}

		cmd += " " + channel;

		if (typeof(file) != "string") {
			cb = options;
			options = file;
			file = false;
		}

		if (typeof(options) != "object") {
			cb = options;
			options = {};
		}

		if (typeof(cb) != "function") cb = false;

		if (file) cmd += " \"" + file.replace(/\\/g, "\\\\") + "\"";

		if (options.loop) cmd += " LOOP";

		// this should be validated
		if (options.transition) cmd += " " + options.transition;

		if (options.seek && parseInt(options.seek, 10) > 0) cmd += " SEEK " + options.seek;

		if (options.length && parseInt(options.seek, 10) > 0) cmd += " SEEK " + options.length;

		if (options.filter) cmd += " " + options.filter;

		if (options.auto) cmd += " AUTO";

		self.sendCommand(cmd, cb);
	};

	// ---
	// ccg.load
	// ---
	// Load media file
	// [LOAD](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#LOAD)
	ccg.prototype.load = function (channel, file, options, cb) {
		sendPlayoutCommand(this, "LOAD", channel, file, options, cb);
	};

	// ---
	// ccg.loadBg
	// ---
	// Load media file into background
	// [LOADBG](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#LOADBG)
	ccg.prototype.loadBg = function (channel, file, options, cb) {
		sendPlayoutCommand(this, "LOADBG", channel, file, options, cb);
	};

	// ---
	// ccg.play
	// ---
	// Play media file
	// [PLAY](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#PLAY)
	ccg.prototype.play = function (channel, file, options, cb) {
		sendPlayoutCommand(this, "PLAY", channel, file, options, cb);
	};

	// ---
	// ccg.pause
	// ---
	// Pauses a media file on a channel or layer
	//
	// [PAUSE](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#PAUSE)
	ccg.prototype.pause = function (channel, cb) {
		this.sendCommand("PAUSE " + channel, cb);
	};

	// ---
	// ccg.resume
	// ---
	// Resumes playback of a foreground clip previously paused with the PAUSE command.
	//
	// [PAUSE](http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#RESUME)
	ccg.prototype.resume = function (channel, cb) {
		this.sendCommand("RESUME " + channel, cb);
	};

	// ---
	// ccg.stop
	// ---
	// Stops a media file on a channel or layer
	//
	// [STOP](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#STOP)
	ccg.prototype.stop = function (channel, cb) {
		this.sendCommand("STOP " + channel, cb);
	};

	// ---
	// ccg.clear
	// ---
	// Clears a channel or layer
	//
	// [CLEAR](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#CLEAR)
	ccg.prototype.clear = function (channel, cb) {
		this.sendCommand("CLEAR " + channel, cb);
	};

	// ---
	// ccg.updateMediaProperty
	// ---
	// Changes property of media playout
	//
	// [CALL](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#CALL)
	ccg.prototype.updateMediaProperty = function (channel, key, value, cb) {
		if (typeof(value) == "boolean") {
			value = (value) ? 1 : 0;
		}

		if (typeof(channel) == "number") {
			channel = channel.toString();
		}

		if (typeof(channel) != "string" || !/[0-9]+-[0-9]+/.test(channel)) {
			this.log("Invalid channel");
			return cb && cb(new Error("Invalid channel"));
		}

		var command = "CALL " + channel + " " + key + " " + value;
		this.sendCommand(command, cb);
	};

	// ---
	// ccg.swap
	// ---
	// Swaps layers between channels (both foreground and background will be swapped)
	//
	// [CLEAR](http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#SWAP)
	ccg.prototype.swap = function (src, dest, cb) {
		this.sendCommand("SWAP " + src + " " + dest, cb);
	};

	// ---
	// ccg.print
	// ---
	// Saves an RGBA PNG bitmap still image of the contents of the specified channel in the media folder
	//
	// [CLEAR](http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#PRINT)
	ccg.prototype.print = function (channel, cb) {
		this.sendCommand("PRINT " + channel, cb);
	};

	// ---
	// ccg.print
	// ---
	// Changes the log level of the server (trace,debug,info,warning,error,fatal)
	//
	// [CLEAR](http://casparcg.com/wiki/CasparCG_2.1_AMCP_Protocol#LOG_LEVEL)
	ccg.prototype.logLevel = function (level, cb) {
		this.sendCommand("LOG LEVEL " + level, cb);
	};

};
