"use strict";

var _ = require("underscore");

// inspired by xml2json and xml-mapping
module.exports = function (xml, cb) {
	if (typeof xml != "string") return xml;

	// use sax with strict off and trim on
	var parser = require("sax").parser(false, {trim: true});

	// holds the object we are building
	var out = false;
	var currentPath = [];

	// helper function to prepare a path for values
	// this will convert a node into an array if it already exists
	function makePath(object, path, index) {
		index = index || 0;
		var obj;

		if (path.length > index + 1) {
			obj = object[path[index]];

			// we always want the last object in an array
			if (_.isArray(obj)) obj = _.last(obj);

			makePath(obj, path, index + 1);
		} else {
			obj = object[path[index]];

			if (!obj) {
				// object doesn't exist yet so make it
				object[path[index]] = {};
			} else {
				if (!_.isArray(obj)) {
					// object isn't an array yet so make an array with the object as the first element
					object[path[index]] = [obj];
				}

				// append the new object
				object[path[index]].push({});
			}
		}
	}

	// helper function to set the value of a path
	function setValueForPath(object, path, value, index) {
		index = index || 0;

		if (path.length > index + 1) {
			var obj = object[path[index]];

			// we always want the last object in an array
			if (_.isArray(obj)) obj = _.last(obj);

			setValueForPath(obj, path, value, index + 1);
		} else {
			// found the object so set its value
			object[path[index]] = value;
		}
	}

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

			// create the path
			makePath(out, currentPath);
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
