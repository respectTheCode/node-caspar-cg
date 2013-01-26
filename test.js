var CasparCG = require("./");
var async = require("async");

ccg = new CasparCG({
	host: "localhost",
	port: 5250,
	debug: true
});

ccg.connect(function () {
	ccg.play("1-1", "tests/test/AMB");

	// ccg.getTemplates(function (err, templates) {
	// 	async.forEach(templates, function (template, cb) {
	// 		ccg.getTemplateInfo(template.file, function (err, data) {
	// 			console.log(template.file, data);
	// 			cb(err);
	// 		});
	// 	}, function (err) {
	// 		console.log("done", err);
	// 	});
	// });

	// ccg.listData(function (err, data) {
	// 	console.log("list", data);
	// });

	// ccg.storeData("SomeData", {
	// 	f0: "FirstName LastName",
	// 	f1: "Something about FirstName LastName",
	// 	f2: new Date().toString()
	// }, function (err) {
	// 	ccg.loadData("SomeData", function (err, data) {
	// 		console.log("data:", data);
	// 	});

	// 	ccg.loadTemplate("1-2", "Gymnastics/LT-SINGLE NAME", "SomeData", function () {
	// 		ccg.playTemplate("1-2");

	// 		setTimeout(function () {
	// 			ccg.updateTemplateData("1-2", {f0: "Someones Name", f1: "Some title"});
	// 		}, 2 * 1000);

	// 		setTimeout(function () {
	// 			ccg.stopTemplate("1-2");
	// 		}, 4 * 1000);
	// 	});
	// });

	// ccg.getMediaFiles(function (err, serverInfo) {
	// 	console.log("getMediaFiles", serverInfo);
	// });

	// ccg.getMediaFileInfo("AMB 1080i60", function (err, serverInfo) {
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
		ccg.clear("1", function () {
			ccg.disconnect();
		});
	}, 5 * 1000);
});
