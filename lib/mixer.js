"use strict";

module.exports = function (ccg) {

	ccg.prototype.mixerFill = function (channel, grid, cb) {
		var self = this;

		if (typeof(channel) == "number") {
			channel = channel.toString();
		}

		if (typeof(channel) != "string" || !/[0-9]+-[0-9]+/.test(channel)) {
			self.log("Invalid channel");
			return cb && cb(new Error("Invalid channel"));
		}

		var cmd = "MIXER " + channel + " FILL ";

		cmd += (grid.x || "0") + " ";
		cmd += (grid.y || "0") + " ";
		cmd += (grid.w || "0") + " ";
		cmd += (grid.h || "0");

		self.sendCommand(cmd, cb);
	};

};
