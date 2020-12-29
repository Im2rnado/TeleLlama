const mongoose = require("mongoose");

const DeviceAuth = new mongoose.Schema({
	authorID: {
		type: String,
	},
	accountId: {
		type: String,
	},
	deviceId: {
		type: String,
	},
	secret: {
		type: String,
	},
	displayname: {
		type: String,
	},
});

module.exports = mongoose.model("deviceauth5", DeviceAuth);