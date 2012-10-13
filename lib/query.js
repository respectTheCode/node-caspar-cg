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
				file = file.match(/[^\s"']+|\\"([^\\"]*)\\"|\\'([^\\']*)\\'/g);

				// check for a valid line or move on
				if (!file || file.length != 4) continue;

				out.push({
					file: file[0],
					type: file[1],
					length: file[2],
					date: file[3]
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
				file = file.match(/[^\s"']+|\\"([^\\"]*)\\"|\\'([^\\']*)\\'/g);

				// check for a valid line or move on
				if (!file || file.length != 4) continue;

				out.push({
					file: file[0],
					type: file[1],
					length: file[2],
					date: file[3]
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
				file = file.match(/[^\s"']+|\\"([^\\"]*)\\"|\\'([^\\']*)\\'/g);

				out.push({
					file: file[0],
					length: file[1],
					date: file[2]
				});
			}

			cb(null, out);
		});
	};

	// ---
	// ccg.info
	// ---
	// Returns info about a server, channel or template
	//
	// [INFO](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#INFO)
	// ([channel:int]{-[layer:int]}|TEMPLATE [filename:string])
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

			console.log(typeof(data));

			if (data.substr(0, 1) == "<") {
				xml(data, cb);
			} else {
				data = data.split("\r\n");
				cb(null, data);
			}
		});
	};
};
