# CasparCG to Node interface

[![Build Status](https://travis-ci.org/respectTheCode/node-caspar-cg.png)](https://travis-ci.org/respectTheCode/node-caspar-cg)

This project is early in development and API may change. The query, playout, data and template commands are mostly finished and I will be adding more as I need them. If you need something that is missing add an issue.

For now docs are in the source only. I will be moving them to github pages at some point.

## Road Map
	0.1 - Implement the entire AMCP Protocol
	0.2 - First stable release
	0.3 - Add events for all commands and channel/layer status by polling
	0.4 - Stable release

## Install

	npm install caspar-cg

## Usage Example

	var CasparCG = require("caspar-cg");

	ccg = new CasparCG("localhost", 5250);
	ccg.connect(function () {
		ccg.info(function (err, serverInfo) {
			console.log(serverInfo);
		});

		ccg.play("1-1", "AMB");

		setTimeout(function () {
			ccg.clear("1");
			ccg.disconnect();
		}, 10 * 1000);
	});

	ccg.on("connected", function () {
		console.log("Connected");
	});

## Changelog

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
