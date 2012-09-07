# CasparCG to Node interface

This project is very early in developement and API will most likely change. I will be using this in a fairly large project so the APIs will stablelize quickly. Once a functional portion of the protocal is implemented I will publish this project to NPM.

For now auto generated docs in the docs folder.

## Example

  var ccg = require("CasparCG");

	ccg.connect("localhost", 5250, function () {
		ccg.info(function (err, serverInfo) {
			console.log(serverInfo);
		});
	});
