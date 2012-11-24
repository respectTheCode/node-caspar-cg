module.exports = function (ccg) {

	// ---
	// ccg.xmlToDataObject
	// ---
	// create a Javascript object from CasparCG Template Data XML
	//
	// [CasparCG Template Data XML](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#Template_Data)
	ccg.prototype.xmlToDataObject = function (xml) {
		if (typeof(xml) !== "string") {
			return false;
		}

		if (
			(xml.substr(0, "<templateData>".length) != "<templateData>") &&
			(xml.substr(- "</templateData>".length) != "</templateData>")
		) {
			return false;
		}

		var parts = xml.split("<componentData");
		parts.shift();

		var out = {};

		for (var i in parts) {
			var part = parts[i];

			part = /\sid="([a-zA-Z0-9]+)">[\s]*<data\sid="[a-zA-Z0-9]+"\svalue="([^"\\]*(\\.[^"\\]*)*)"/.exec(part);

			out[part[1]] = part[2];
		}

		return out;
	};

	// ---
	// ccg.datObJectToXml
	// ---
	// write CasparCG Template Data XML from a Javascript object
	//
	// [CasparCG Template Data XML](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#Template_Data)
	ccg.prototype.datObJectToXml = function (obj) {
		var out = "<templateData>";

		for (var key in obj) {
			var val = obj[key];

			if (typeof(val) == "number") {
				val = parseInt(val, 10);
			}

			if (typeof(val) !== "string") {
				continue;
			}

			val = val.replace('"', '\\"');

			out += "<componentData id=\"" + key + "\">";
			out += "<data id=\"text\" value=\"" + val + "\" />";
			out += "</componentData>";
		}

		out += "</templateData>";

		return out;
	};

	// ---
	// ccg.listData
	// ---
	// Returns a list of stored data names
	//
	// [DATA LIST](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#DATA_LIST)
	ccg.prototype.listData = function (cb) {
		var self = this;

		// callback is required
		if (typeof(cb) != "function") {
			self.log("Invalid arguments");
			return;
		}

		self.sendCommand("DATA LIST", function (err, data) {
			if (err) {
				cb(err);
				return;
			}

			data = data.split("\r\n");
			cb(null, data);
		});
	};

	// ---
	// ccg.storeData
	// ---
	// Store datatset
	//
	// [DATA STORE](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#DATA_STORE)
	ccg.prototype.storeData = function (name, data, cb) {
		var xml = this.datObJectToXml(data);

		xml = xml.replace(/"/g, '\\"');

		this.sendCommand("DATA STORE " + name + " \"" + xml + "\"", cb);
	}

	// ---
	// ccg.loadData
	// ---
	// Load datatset
	//
	// [DATA RETRIEVE](http://casparcg.com/wiki/CasparCG_2.0_AMCP_Protocol#DATA_RETRIEVE)
	ccg.prototype.loadData = function (name, cb) {
		var self = this;

		// callback is required
		if (typeof(cb) != "function") {
			self.log("Invalid arguments");
			return;
		}

		this.sendCommand("DATA RETRIEVE " + name, function (err, data) {
			if (err) {
				cb(err);

				return;
			}

			var obj = self.xmlToDataObject(data);

			cb(null, obj);
		});
	}
}