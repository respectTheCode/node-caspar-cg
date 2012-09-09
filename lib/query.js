module.exports = function (ccg) {
	// ccg.getMediaFiles
	// ---
	// Returns info about all available media files
	//
	// [CLS](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#CLS)
	ccg.prototype.getMediaFiles = function (cb) {
		var self = this;

		// check for connection first
		if (!self.connected) return false;

		self.sendCommand("CLS", true, function (err, files) {
			if (err) {
				cb(err);
				return;
			}

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

		// check for connection first
		if (!self.connected) return false;

		self.sendCommand("CINF \"" + filename + "\"", function (err, files) {
			if (err) {
				cb(err);
				return;
			}

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
	// ccg.getMediaFiles
	// ---
	// Returns info about all available templates
	//
	// [TLS](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#TLS)
	// {folder:string|./}
	//
	// There seems to be a bug with TLS ignoring the folder
	//
	ccg.prototype.getTemplates = function (folder, cb) {
		var self = this;

		// check for connection first
		if (!self.connected) return false;

		var command = "TLS";

		if (folder && cb) {
			command += " " + folder;
		} else {
			cb = folder;
		}

		self.sendCommand(command, function (err, files) {
			if (err) {
				cb(err);
				return;
			}

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
	ccg.prototype.info = function (channel, layer, cb) {
		var self = this;

		// check for connection first
		if (!self.connected) return false;

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

		self.sendCommand(command, function (err, data) {

			if (cb) {
				cb(null, data);
			}
		});
	};
};
