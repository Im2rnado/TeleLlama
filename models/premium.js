const mongoose = require("mongoose");

const PremiumUsers = new mongoose.Schema({
	ID: {
		type: String,
	},
});

module.exports = mongoose.model("premium", PremiumUsers);