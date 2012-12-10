var xml = require("./xml2json");

module.exports = function (ccg) {
	// ccg.getMediaFiles
	// ---
	// Returns info about all available media files
	//
	// [CLS](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#CLS)
	ccg.prototype.getMediaFiles = function (cb) {
		var self = this;

		// callback is required
		if (typeof(cb) != "function") {
			self.log("Invalid arguments");
			return;
		}

		self.sendCommand("CLS", function (err, data) {
			if (err) {
				cb(err);
				return;
			}

			var files = data.split("\r\n");

			var out = [];

			for (var index in files) {
				var file = files[index];

				// split file parts and strip quotes
				file = /"([^"]*)"[\s]+([^\s]*)[\s]+([^\s]*)[\s]+([^\s]*)/.exec(file);

				out.push({
					file: file[1],
					type: file[2],
					length: file[3],
					date: new Date(
						parseInt(file[4].substr(0,4), 10),
						parseInt(file[4].substr(4, 2), 10) -1, // month is 0 based in js
						parseInt(file[4].substr(6, 2), 10),
						parseInt(file[4].substr(8, 2), 10),
						parseInt(file[4].substr(10, 2), 10),
						parseInt(file[4].substr(12, 2), 10)
					)
				});
			}

			cb(null, out);
		});
	};

	// ---
	// ccg.getMediaFileInfo
	// ---
	// Returns info about all media files matching filename
	//
	// [CINF](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#CINF)
	ccg.prototype.getMediaFileInfo = function (filename, cb) {
		var self = this;

		if (typeof(filename) != "string") {
			self.log("Invalid arguments");
			return;
		}

		// callback is required
		if (typeof(cb) != "function") {
			self.log("Invalid arguments");
			return;
		}

		self.sendCommand("CINF \"" + filename + "\"", function (err, data) {
			if (err) {
				if (cb) cb(err);
				return;
			}

			var files = data.split("\r\n");

			var out = [];

			for (var index in files) {
				var file = files[index];

				// split file parts and strip quotes
				file = /"([^"]*)"[\s]+([^\s]*)[\s]+([^\s]*)[\s]+([^\s]*)/.exec(file);

				out.push({
					file: file[1],
					type: file[2],
					length: file[3],
					date: new Date(
						parseInt(file[4].substr(0,4), 10),
						parseInt(file[4].substr(4, 2), 10) -1, // month is 0 based in js
						parseInt(file[4].substr(6, 2), 10),
						parseInt(file[4].substr(8, 2), 10),
						parseInt(file[4].substr(10, 2), 10),
						parseInt(file[4].substr(12, 2), 10)
					)
				});
			}

			cb(null, out);
		});
	};

	// ---
	// ccg.getTemplates
	// ---
	// Returns info about all available templates
	// Returns info about all available templates
	//
	// [TLS](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#TLS)
	ccg.prototype.getTemplates = function (folder, cb) {
		var self = this;

		if (typeof(folder) != "string") {
			cb = folder;
			folder = false;
		}

		// callback is required
		if (typeof(cb) != "function") {
			self.log("Invalid arguments");
			return;
		}

		var command = "TLS";

		if (folder) command += " " + folder;

		self.sendCommand(command, function (err, data) {
			if (err) {
				cb(err);
				return;
			}

			var files = data.split("\r\n");

			var out = [];

			for (var index in files) {
				var file = files[index];

				// split file parts and strip quotes
				file = /"([^"]*)"\s([^\s]*)\s([^\s]*)/.exec(file);

				out.push({
					file: file[1],
					length: file[2],
					date: new Date(
						parseInt(file[3].substr(0,4), 10),
						parseInt(file[3].substr(4, 2), 10) -1, // month is 0 based in js
						parseInt(file[3].substr(6, 2), 10),
						parseInt(file[3].substr(8, 2), 10),
						parseInt(file[3].substr(10, 2), 10),
						parseInt(file[3].substr(12, 2), 10)
					)
				});
			}

			cb(null, out);
		});
	};

	// ---
	// ccg.getTemplateInfo
	// ---
	// Returns info about a template
	//
	// [INFO](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#INFO)
	ccg.prototype.getTemplateInfo = function (file, cb) {
		var self = this;


		if (typeof(file) != "string") {
			self.log("Invalid arguments");
			return;
		}

		// callback is required
		if (typeof(cb) != "function") {
			self.log("Invalid arguments");
			return;
		}

		self.sendCommand("INFO TEMPLATE \"" + file.replace("\\", "\\\\") + "\"", function (err, data) {
			if (err) {
				cb(err);
				return;
			}

			if (!data) {
				cb("err" + file);
				return;
			}

			var parts = data.split("\n");
			var part;
			data = {fields: []};

			for(var i in parts) {
				part = /[\s]*<instance\sname="([^"]*)"\stype="CasparTextField"\/>/.exec(parts[i]);

				if (part) {
					data.fields.push(part[1]);
				}

				part = /[\s]*<parameter\sid="([^"]*)"/.exec(parts[i]);

				if (part) {
					data.fields.push(part[1]);
				}
			}

			cb(null, data);
		});
	};

	// ---
	// ccg.info
	// ---
	// Returns info about a server or channel
	//
	// [INFO](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#INFO)
	ccg.prototype.info = function (channel, cb) {
		var self = this;

		var command = "INFO";

		if (typeof(channel) != "string") {
			cb = channel;
			channel = false;
		}

		// callback is required
		if (typeof(cb) != "function") {
			self.log("Invalid arguments");
			return;
		}

		if (channel) command += " " + channel;

		self.sendCommand(command, function (err, data) {
			if (err) {
				cb(err);
				return;
			}

			if (data.substr(0, 1) == "<") {
				xml(data, cb);
			} else {
				data = data.split("\r\n");
				cb(null, data);
			}
		});
	};
};
