/* global Module */

/* Magic Mirror
 * Module: HelloWorld
 *
 * By Dion Gonano
 * MIT Licensed.
 */

Module.register("MMM-Display",{

	// Default module config.
	defaults: {
		text: "Hello World!"
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	}
});
