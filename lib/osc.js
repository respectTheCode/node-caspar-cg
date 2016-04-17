"use strict";

const osc = require("node-osc");
const _ = require("underscore");

module.exports = function (ccg) {
	if (!ccg.options.osc) return;

	const oscServer = new osc.Server(ccg.options.oscPort, "0.0.0.0");

	let channels = {};
	let channelTimeouts = {};
	const oscTimeout = ccg.options.oscTimeout;

	let emit = ccg.emit.bind(ccg);

	if (ccg.options.oscThrottle) {
		emit = _.throttle(emit, ccg.options.oscThrottle);
	}

	oscServer.on("message", function (msg, rinfo) {
		try {
			msg.shift(); // bundle
			msg.shift(); // OSC Time Tag (not parsed correctly)

			let message;
			while (msg.length > 0) {
				message = msg.shift();
				parseMessage(message[0], message[1], message[2] || false);
			}

			const now = new Date().getTime();
			Object.keys(channelTimeouts).forEach(channelNumber => {
				const channelTimeout = channelTimeouts[channelNumber];
				Object.keys(channelTimeout).forEach(layerNumber => {
					const layerTimeout = channelTimeout[layerNumber];

					if (layerTimeout.ts + oscTimeout < now) {
						delete channels[channelNumber].layers[layerNumber];
						delete channelTimeout[layerNumber];
						return;
					}

					if (layerTimeout.file + oscTimeout < now) {
						delete channels[channelNumber].layers[layerNumber].file;
						delete channelTimeout[layerNumber].file;
						return;
					}

					if (layerTimeout.file + oscTimeout < now) {
						delete channels[channelNumber].layers[layerNumber].host;
						delete channelTimeout[layerNumber].host;
						return;
					}
				});
			});

			emit("status", channels);
		} catch (err) {
			ccg.log("OSC Parsing Error", err);
		}
	});

	// clear all when disconnected
	ccg.on("disconnected", () => {
		channels = {};
		channelTimeouts = {};
	});

	function parseMessage(message, value, value2) {
		const now = new Date().getTime();
		const parts = message.split("/");
		parts.shift();

		if (parts.length <= 0) return console.log("too short", parts);
		if (parts[0] !== "channel") return console.log("not channel", parts);

		const channel = channels[parts[1]] = channels[parts[1]] || {
			layers: {},
			audioChannels: {}
		};
		const channelTimeout = channelTimeouts[parts[1]] = channelTimeouts[parts[1]] || {};

		if (parts[2] === "stage") {
			if (parts[3] === "layer") {
				if (parts.length < 6) return console.log("too short", parts);
				const layer = channel.layers[parts[4]] = channel.layers[parts[4]] || {};
				channelTimeout[parts[4]] = channelTimeout[parts[4]] || {};
				channelTimeout[parts[4]].ts = now;

				switch (parts[5]) {
					case "time":
						layer.time = value;
						return;
					case "frame":
						layer.frame = value;
						return;
					case "type":
						layer.type = value;
						return;
					case "paused":
						layer.paused = value;
						return;
					case "buffer":
						layer.buffer = value;
						return;
					case "loop":
						layer.loop = value;
						return;
					case "profiler":
						switch (parts[6]) {
							case "time":
								layer.profiler = {
									actual: value,
									expected: value2
								};
								return;
						}
						return;
					case "host":
						const host = layer.host = layer.host || {};
						channelTimeout[parts[4]].host = now;
						switch (parts[6]) {
							case "width":
								host.width = value;
								return;
							case "height":
								host.height = value;
								return;
							case "path":
								if (value.indexOf("\\\\") >= 0) {
									value = value.split("\\\\")[1];
								}

								host.path = value;
								return;
							case "fps":
								host.fps = value;
								return;
						}
						break;
					case "file":
						const file = layer.file = layer.file || {};
						channelTimeout[parts[4]].file = now;
						switch (parts[6]) {
							case "time":
								file.time = value;
								file.totalTime = value2;
								return;
							case "frame":
								file.frame = value;
								file.totalFrames = value2;
								return;
							case "fps":
								file.fps = value;
								return;
							case "path":
								file.path = value;
								return;
							case "loop":
								file.loop = value;
								return;
						}
						break;
				}
			}
		}

		if (parts[2] === "mixer") {
			if (parts[3] === "audio") {
				if (parts[4] === "nb_channels") {
					channel.nbChannels = value;
					return;
				}

				const audioChannel = channel.audioChannels[parts[4]] = channel.audioChannels[parts[4]] || {};

				switch (parts[5]) {
					case "pFS":
						audioChannel.pFS = value;
						return;
					case "dBFS":
						audioChannel.dBFS = value;
						return;
				}
			}
		}
	}
};
