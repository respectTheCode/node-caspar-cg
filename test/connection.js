"use strict";

var net = require("net");
var assert = require("chai").assert;

var CasparCG = require("../");

var debug = false;

describe("connection", function () {
	var ccg;
	var connection;

	before(function (done) {
		var server = new net.createServer();
		server.listen(1234);

		server.on("connection", function (socket) {
			connection = socket;
			done();
		});

		ccg = new CasparCG({
			host: "localhost",
			port: 1234,
			debug: debug
		});

		ccg.connect();
	});

	it("should connect", function (done) {
		connection.on("data", function (data) {
			data = data.toString();

			assert.equal(data, "PLAY 1-1 \"AMB\"\r\n", "data is a play command");

			done();
		});

		ccg.play("1-1", "AMB");
	});

	describe("with 2 connections", function () {
		var ccg2;
		var connection2;

		before(function (done) {
			var server = new net.createServer();
			server.listen(1235);

			server.on("connection", function (socket) {
				connection2 = socket;
				done();
			});

			ccg2 = new CasparCG({
				host: "localhost",
				port: 1235,
				debug: debug
			});

			ccg2.connect();
		});

		it("should connect on connection 1", function (done) {
			connection.on("data", function (data) {
				data = data.toString();

				assert.equal(data, "PLAY 2-1 \"AMB\"\r\n", "data is a play command");

				done();
			});

			ccg.play("1-1", "AMB");
		});

		it("should connect on connection 2", function (done) {
			connection2.on("data", function (data) {
				data = data.toString();

				assert.equal(data, "PLAY 2-1 \"AMB\"\r\n", "data is a play command");

				done();
			});

			ccg2.play("2-1", "AMB");
		});

		after(function () {
			ccg2.close();
		});
	});

	after(function () {
		ccg.close();
	});
});
