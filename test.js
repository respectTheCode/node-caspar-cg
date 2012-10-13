var CasparCG = require("./");

ccg = new CasparCG({
	host: "localhost",
	port: 5250,
	debug: true
});

ccg.connect(function () {
	ccg.play("1-1", "AMB");

	ccg.storeData("SomeData", {
		f0: "FirstName LastName",
		f1: "Something about FirstName LastName"
	}, function (err) {
		ccg.loadData("SomeData", function (err, data) {
			console.log(data);
		});
	});

	// ccg.getMediaFiles(function (err, serverInfo) {
	// 	console.log("getMediaFiles", serverInfo);
	// });

	// ccg.getMediaFileInfo("AMB", function (err, serverInfo) {
	// 	console.log("getMediaFileInfo", serverInfo);
	// });

	// ccg.getTemplates(function (err, serverInfo) {
	// 	console.log("info", serverInfo);
	// });

	// ccg.info(function (err, serverInfo) {
	// 	console.log("info", serverInfo);
	// });

	// ccg.info("1", function (err, serverInfo) {
	// 	console.log("info 1", serverInfo);
	// });

	// ccg.info("1-1", function (err, serverInfo) {
	// 	console.log("info 1-1", serverInfo);
	// });

	setTimeout(function () {
		ccg.clear("1");
	}, 1 * 1000);

	setTimeout(function () {
		ccg.disconnect();
	}, 5 * 1000);
});
