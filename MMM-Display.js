/* global Module, Log, MM, config */

/* Magic Mirror
 * Module: MMM-Display
 *
 * By Dion Gonano
 * MIT Licensed.
 */

Module.register("MMM-Display", {

	requiresVersion: "2.0.0",

	// Default module config.
	defaults: {
		fadeSpeed: 2000,
		displayTimeout: 5000,
		defaultMessage: "I see you ;)"
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.settingsVersion = 1;

		this.message = this.config.defaultMessage;

		this.timeoutID = "";
	},

	getStyles: function() {
		return ["remote-control.css"];
	},

	notificationReceived: function(notification, payload, sender) {
		if (sender) {
			Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
			if (notification === "DISPLAY_ACTION") {
				this.sendSocketNotification(notification, payload);	
			}
		} else { 
			if (notification === "DOM_OBJECTS_CREATED") {
				//Started, send language
				this.sendSocketNotification("INIT", {lang: config.language, defaultMessage: this.config.defaultMessage});
			}
		}
	},

	// Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
		if (notification === "MESSAGE") {
			Log.log(payload);
			//record message
			this.message = payload.value;

			//Clear and Set new timeout.
			var self = this;
			clearTimeout(this.timeoutID);
			this.timeoutID = setTimeout(function() {
				self.timeoutID = "";
				self.updateDom(self.config.fadeSpeed);
			}, this.config.displayTimeout);
			//Request update now timeoutID is set
			this.updateDom(this.config.fadeSpeed);
		}
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		if (this.timeoutID === "") {
			return wrapper;
		} 
		//Show message
		if (!this.message) {
			this.message = this.config.defaultMessage;
		}
		wrapper.innerHTML = this.message;
		wrapper.className = "normal large light";
		return wrapper;
	},
});
