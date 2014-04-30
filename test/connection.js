"use strict";

var net = require("net");
var assert = require("chai").assert;

var CasparCG = require("../");

var debug = true;
var port = 8000;

describe("connection", function () {
	var ccg1;
	var server1;
	var connection1;

	before(function (done) {
		server1 = new net.createServer();
		server1.listen(port);

		server1.on("connection", function (socket) {
			connection1 = socket;
			done();
		});

		ccg1 = new CasparCG({
			host: "localhost",
			port: port,
			debug: debug
		});

		ccg1.connect();
		port++;
	});

	it("should connect and send 1 command", function (done) {
		connection1.on("data", function (data) {
			assert.equal(data.toString(), "PLAY 1-0 \"AMB\"\r\n", "data is a play command");
			this.write("202 Play OK\r\n");
			connection1.removeAllListeners("data");
		});

		ccg1.play("1-0", "AMB", done);
	});

	describe("with 2 connections", function () {
		var ccg2;
		var server2;
		var connection2;
		var ccg3;
		var server3;
		var connection3;

		before(function (done) {
			server2 = new net.createServer();
			server2.listen(port);

			server2.on("connection", function (socket) {
				connection2 = socket;
				
				server3 = new net.createServer();
				server3.listen(port);

				server3.on("connection", function (socket) {
					connection3 = socket;
					done();
				});

				ccg3 = new CasparCG({
					host: "localhost",
					port: port,
					debug: debug
				});

				ccg3.connect();
				port++;
			});

			ccg2 = new CasparCG({
				host: "localhost",
				port: port,
				debug: debug
			});

			ccg2.connect();
			port++;
		});

		var cleanup = function () {
			connection1.removeAllListeners("data");
			connection2.removeAllListeners("data");
			connection3.removeAllListeners("data");
		};

		it("should only send to connection 1", function (done) {
			connection1.on("data", function (data) {
				assert.equal(data.toString(), "PLAY 1-1 \"AMB\"\r\n", "data is a play command");
				this.write("202 Play OK\r\n");
				cleanup();
			});
			connection2.on("data", function (data) {
				assert(false, "should not get data on 1");
				cleanup();
			});
			connection3.on("data", function (data) {
				assert(false, "should not get data on 2");
				cleanup();
			});

			ccg1.play("1-1", "AMB", done);
		});

		it("should only send to connection 2", function (done) {
			connection2.on("data", function (data) {
				assert.equal(data.toString(), "PLAY 2-1 \"AMB\"\r\n", "data is a play command");
				this.write("202 Play OK\r\n");
				cleanup();
			});
			connection1.on("data", function (data) {
				assert(false, "should not get data on 0");
				cleanup();
			});
			connection3.on("data", function (data) {
				assert(false, "should not get data on 2");
				cleanup();
			});

			ccg2.play("2-1", "AMB", done);
		});

		it("should only send to connection 3", function (done) {
			connection3.on("data", function (data) {
				assert.equal(data.toString(), "PLAY 3-1 \"AMB\"\r\n", "data is a play command");
				this.write("202 Play OK\r\n");
				cleanup();
			});
			connection1.on("data", function (data) {
				assert(false, "should not get data on 0");
				cleanup();
			});
			connection2.on("data", function (data) {
				assert(false, "should not get data on 1");
				cleanup();
			});

			ccg3.play("3-1", "AMB", done);
		});
	});
});
