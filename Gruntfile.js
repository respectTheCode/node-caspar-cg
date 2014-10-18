"use strict";

module.exports = function (grunt) {
	grunt.initConfig({
		mochaTest: {
			options: {
				reporter: "spec"
			},
			unit: {
				src: ["test/**/*.js"]
			}
		},
		jshint: {
			options: {
				reporter: require("jshint-stylish")
			},
			javascript: {
				src: [
					"lib/**/*.js",
					"index.js",
					"tests/**/*.js"
				],
				options: {
					jshintrc: ".jshintrc"
				}
			}
		},
		jscs: {
			javascript: {
				src: [
					"lib/**/*.js",
					"index.js",
					"tests/**/*.js"
				],
			}
		}
	});

	grunt.registerTask("default", ["jshint", "mochaTest"]);

	require("load-grunt-tasks")(grunt);
};
