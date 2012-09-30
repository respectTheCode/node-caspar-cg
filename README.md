# CasparCG to Node interface

This project is early in development and API may change. The query and playout commands are mostly finished and I will be adding more as I need them. If you need something that is missing add an issue.

For now docs are in the source only. I will be moving them to github pages at some point.

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
