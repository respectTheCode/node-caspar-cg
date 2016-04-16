# CasparCG to Node interface

[![Build Status](https://travis-ci.org/respectTheCode/node-caspar-cg.png)](https://travis-ci.org/respectTheCode/node-caspar-cg)

This project is early in development and API may change. The query, playout, data and template commands are mostly finished and I will be adding more as I need them. If you need something that is missing add an issue.

For now docs are in the source only.

## Install

	npm install caspar-cg

## Usage Example

	var CasparCG = require("caspar-cg");

	ccg = new CasparCG({
		host: "localhost",
		port: 5250,
		debug: true,
		osc: true, // osc status updates are opt in
		oscThrottle: 250 // throttles status updates in ms
	});

	ccg.connect(() => {
		ccg.info((err, serverInfo) => {
			console.log(serverInfo);
		});

		ccg.play("1-1", "AMB");
		ccg.loadTemplate("1-20", "NTSC-TEST-60", true);

		setTimeout(() => {
			ccg.clear("1");
			ccg.disconnect();
		}, 60 * 1000);
	});

	ccg.on("connected", () => {
		console.log("Connected");
	});

	// must opt in to osc
	ccg.on("status", status => {
		console.log(JSON.stringify(status));
	});

## Change log

###v0.1.1

* Adds OSC Status updates

### v0.1.0

* Fix `disconnected` event on node v4+
* Requires node v4+

### v0.0.9

* Fix `info` parsing error when parsing `image-producer` data

### v0.0.8

* Adds `resume`
* Adds `swap`
* Adds `print`
* Adds `logLevel`

### v0.0.7

* Adds `mixerFill` to move and resize layers

### v0.0.6

`ccg.info()` now parses layers and returns a much more predictable result.

* Layers is always an array
* Numbers and Booleans are parsed (all values were strings before)
* Parameters with `-` and `_` are replaced with cammel case
* Inconsistent parameters are renamed

### v0.0.5-5

Socket errors are now emitted as `connectionError` instead of `error`.
