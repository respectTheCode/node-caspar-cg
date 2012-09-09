// inspired by xml2json and xml-mapping
module.exports = function (xml, cb) {
	if (typeof xml != "string") return xml;

	// use sax with strict off and trim on
	var parser = require("sax").parser(false, {trim: true});

	// holds the object we are building
	var out = false;
	var currentPath = [];

	// helper function to set the value of a path
	function setValueForPath(object, path, value, index) {
		index = index || 0;

		if (path.length > index+1) {
			setValueForPath(object[path[index]], path, value, index+1);
		} else {
			object[path[index]] = value;
		}
	};
	
	parser.onerror = function (err) {
		// should pass this to the callback
		console.log("XML OnError:", err);
	};

	parser.ontext = function (value) {
		setValueForPath(out, currentPath, value);
	};

	parser.onopentag = function (node) {
		if (!out) {
			out = {};
		} else {
			// add the current node to the path
			currentPath.push(node.name.toLowerCase());
			// set the value for to a new object to hold values when the come
			setValueForPath(out, currentPath, {});
		}
	};

	parser.onclosetag = function () {
		// back out
		currentPath.pop();
	};

	parser.onend = function () {
		cb(null, out);
	};

	try {
		// ready go!
		parser.write(xml).close();
	} catch (err) {
		console.log("XML Error:", err);
	}
};
