# CasparCG to Node interface

This project is early in development and API may change. The query and playout commands are mostly finished and I will be adding more as I need them. If you need something that is missing add an issue.

For now docs are in the source only. I will be moving them to github pages at some point.

## Road Map
0.0.4 - Add data commands
0.0.5 - Add template commands
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
