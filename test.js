var CasparCG = require("caspar-cg");

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