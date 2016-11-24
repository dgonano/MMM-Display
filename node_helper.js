/* Magic Mirror
 * Module: Display
 *
 * By Dion Gonano
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const path = require("path");
const url = require("url");
const fs = require("fs");
const exec = require('child_process').exec;
const os = require('os');

module.exports = NodeHelper.create({
	// Subclass start method.
	start: function() {
		var self = this;

		console.log("Starting node helper for: " + self.name);

		// load fall back translation
		self.loadTranslation("en");

		this.template = "";

		fs.readFile(path.resolve(__dirname + "/display.html"), function(err, data) {
			self.template = data.toString();
		});

		//Allow GET of web page
		this.expressApp.get("/display.html", function(req, res) {
			if (self.template === "") {
				res.send(503);
			} else {
				self.callAfterUpdate(function () {
					res.contentType('text/html');
					var transformedData = self.fillTemplates(self.template);
					res.send(transformedData);
				});
			}
		});

		//Allow GET actions
		this.expressApp.get('/display', (req, res) => {
			var query = url.parse(req.url, true).query;

			if (query.action)
			{
				var result = self.executeQuery(query, res);
				if (result === true) {
					return;
				}
			}
			res.send({'status': 'error', 'reason': 'unknown_command', 'info': 'original input: ' + JSON.stringify(query)});
		});
	},

	callAfterUpdate: function(callback, timeout) {
		if (timeout === undefined) {
			timeout = 3000;
		}

		//Anything there that needs to be done before serving the web page

		callback();
	},
	
	executeQuery: function(query, res) {
		var self = this;
		var opts = {timeout: 8000};

		if (query.action === 'MESSAGE')
		{
			res.send({'status': 'success'});
			self.sendSocketNotification(query.action);
			return true;
		}
		return false;
	},
	
	checkForExecError: function(error, stdout, stderr, res) {
		if (error) {
			console.log(error);
			if (res) { res.send({'status': 'error', 'reason': 'unknown', 'info': error}); }
			return;
		}
		if (res) { res.send({'status': 'success'}); }
	},

	translate: function(data) {
		for (var key in this.translation) {
			var pattern = "%%TRANSLATE:" + key + "%%";
			while (data.indexOf(pattern) > -1) {
				data = data.replace(pattern, this.translation[key]);
			}
		}
		return data;
	},

	in: function(pattern, string) {
		return string.indexOf(pattern) !== -1;
	},

	format: function(string) {
		string = string.replace(/MMM-/ig, "");
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	fillTemplates: function(data) {
		data = this.translate(data);

		//Set default vaues here

		// var brightness = 100;
		// if (this.configData) {
		// 	brightness = this.configData.brightness;
		// }
		// data = data.replace("%%REPLACE::BRIGHTNESS%%", brightness);

		// var moduleData = this.configData.moduleData;
		// if (!moduleData) {
		// 	var error =
		// 		'<div class="menu-element button edit-menu">\n' +
		// 			'<span class="fa fa-fw fa-exclamation-circle" aria-hidden="true"></span>\n' +
		// 			'<span class="text">%%TRANSLATE:NO_MODULES_LOADED%%</span>\n' +
		// 		'</div>\n';
		// 	error = this.translate(error);
		// 	return data.replace("<!-- EDIT_MENU_TEMPLATE -->", error);
		// }

		// var editMenu = [];

		// for (var i = 0; i < moduleData.length; i++) {
		// 	if (!moduleData[i]["position"]) {
		// 		continue;
		// 	}

		// 	var hiddenStatus = 'toggled-on';
		// 	if (moduleData[i].hidden) {
		// 		hiddenStatus = 'toggled-off';
		// 		if (moduleData[i].lockStrings && moduleData[i].lockStrings.length) {
		// 			hiddenStatus += ' external-locked';
		// 		}
		// 	}

		// 	var moduleElement =
		// 		'<div id="' + moduleData[i].identifier + '" class="menu-element button edit-button edit-menu ' + hiddenStatus + '">\n' +
		// 			'<span class="stack fa-fw">\n' +
		// 				'<span class="fa fa-fw fa-toggle-on outer-label fa-stack-1x" aria-hidden="true"></span>\n' +
		// 				'<span class="fa fa-fw fa-toggle-off outer-label fa-stack-1x" aria-hidden="true"></span>\n' +
		// 				'<span class="fa fa-fw fa-lock inner-small-label fa-stack-1x" aria-hidden="true"></span>\n' +
		// 			'</span>\n' +
		// 			'<span class="text">' + this.format(moduleData[i].name) + '</span>\n' +
		// 		'</div>\n';

		// 	editMenu.push(moduleElement);
		// }
		// return data.replace("<!-- EDIT_MENU_TEMPLATE -->", editMenu.join("\n"));
		return data;
	},

	loadTranslation: function(language) {
		var self = this;

		fs.readFile(path.resolve(__dirname + "/translations/" + language + ".json"), function(err, data) {
			if (err) {
				return;
			}
			else {
				self.translation = JSON.parse(data.toString());
			}
		});
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		if (notification === "LANG")
		{
			self.loadTranslation(payload);

			// module started, do/send anything here required.
		}
		
		if (notification === "DISPLAY_ACTION")
		{
			this.executeQuery(payload);
		}
		
	},
});
