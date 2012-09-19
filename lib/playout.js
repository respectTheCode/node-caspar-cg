module.exports = function (ccg) {
	var sendPlayoutCommand = function (self, cmd, channel, file, options, cb) {
		cmd += " " + channel;
		cmd += " " + file.replace("\\", "\\\\");

		if (!cb) {
			cb = options;
			options = {};
		}

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
	ccg.prototype.info = function (channel, cb) {
		self.sendCommand("PAUSE " + channel, cb);
	};

	// ---
	// ccg.stop
	// ---
	// Stops a media file on a channel or layer
	//
	// [STOP](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#STOP)
	ccg.prototype.info = function (channel, cb) {
		self.sendCommand("STOP " + channel, cb);
	};

	// ---
	// ccg.clear
	// ---
	// Clears a channel or layer
	//
	// [CLEAR](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#CLEAR)
	ccg.prototype.info = function (channel, cb) {
		self.sendCommand("CLEAR " + channel, cb);
	};

};