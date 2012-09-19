# CasparCG to Node interface

This project is very early in development and API will most likely change. I will be using this in a fairly large project so the APIs will stablelize quickly. Once a functional portion of the protocal is implemented I will publish this project to NPM.

For now auto generated docs in the docs folder.

## Example

	var CasparCG = require("CasparCG");

	ccg = new CasparCG("localhost", 5250);
	ccg.connect(function () {
		ccg.info(function (err, serverInfo) {
			console.log(serverInfo);
		});

		ccg.play("1-1", "AMB");

		setTimeout(function () {
			ccg.clear("1");
		}, 10 * 1000);
	});
