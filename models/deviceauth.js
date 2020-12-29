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
});

module.exports = mongoose.model("deviceauth", DeviceAuth);