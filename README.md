# CasparCG to Node interface

This project is very early in development and API will most likely change. The requirements of the app I was building this for have changed and for the time being this module is on hold.

## Example

	var CasparCG = require("CasparCG");

	ccg = new CasparCG("localhost", 5250);
	ccg.connect(function () {
		ccg.info(function (err, serverInfo) {
			console.log(serverInfo);
		});
	});
