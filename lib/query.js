module.exports = function (ccg) {
	// ccg.info
	// --------
	// Returns info about a server, channel or template
	// 
	// [INFO](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#INFO)
	// ([channel:int]{-[layer:int]}|TEMPLATE [filename:string])
	ccg.info = function (channel, layer, cb) {
		// check for connection first
		if (!ccg.connected) return false;

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

		ccg.sendCommand(command, function (err, data) {
			
			if (cb) {
				cb(null, data);
			}
		});
	};
};
