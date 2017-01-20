# CasparCG to Node interface

[![Build Status](https://travis-ci.org/respectTheCode/node-caspar-cg.png)](https://travis-ci.org/respectTheCode/node-caspar-cg)

This project is early in development and API may change. The query, playout, data and template commands are mostly finished and I will be adding more as I need them. If you need something that is missing add an issue.

For now docs are in the source only.

## Install

	npm install caspar-cg

## Usage Example

	var CasparCG = require("caspar-cg");

	ccg = new CasparCG("localhost", 5250);
	ccg.connect(function () {
		ccg.info(function (err, serverInfo) {
			console.log(serverInfo);
		});

		ccg.play("1-1", "AMB");

		setTimeout(function () {
			ccg.clear("1");
			ccg.disconnect();
		}, 10 * 1000);
	});

	ccg.on("connected", function () {
		console.log("Connected");
	});
	
### Usage with Express and to render html5 templates
This code example requires *express*. The templates are rendered by using *CALL* and stringifying your json payload. The template on your caspar server can cast that string back to json.

```javascript
	var express = require("express");
	var app = express();
	var router = express.Router();
	var path = __dirname + '/app/'; // source code directory
	var bodyParser = require("body-parser");

	var CasparCG = require("caspar-cg");
	ccg = new CasparCG("your-casparcg-ip-address", 5250);

	router.post("/caspar/:template",function(req,res){ // 
	  ccg.connect(function () {
	    var addCommand = 'CG 1-99 ADD 0 your-template-dir/'+req.params.template+' 1';
	    var updateCommand = 'CALL 1-99 UPDATE "'+JSON.stringify(req.body)+'"';
	    ccg.sendCommand(addCommand);
	    ccg.sendCommand(updateCommand, function(){
	      console.log('Command was sent')
	    })
	  });

	  res.send('Command was sent');
	});

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	app.use(express.static('node_modules'))
	app.use(express.static('app'))

	app.use("/",router);

	app.use("*",function(req,res){
	  res.sendFile(path + "404.html");
	});

	app.listen(3000,function(){
	  console.log("Live at Port 3000");
	});
```

## Changelog

### v0.1.0

* Fix `disconnected` event on node v4+
* Requires node v4+

### v0.0.9

* Fix `info` parsing error when parsing `image-producer` data

### v0.0.8

* Adds `resume`
* Adds `swap`
* Adds `print`
* Adds `logLevel`

### v0.0.7

* Adds `mixerFill` to move and resize layers

### v0.0.6

`ccg.info()` now parses layers and returns a much more predictable result.

* Layers is always an array
* Numbers and Booleans are parsed (all values were strings before)
* Parameters with `-` and `_` are replaced with cammel case
* Inconsistent parameters are renamed

### v0.0.5-5

Socket errors are now emitted as `connectionError` instead of `error`.
