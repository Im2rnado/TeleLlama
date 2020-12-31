/* eslint-disable no-inline-comments */
// Database
const premUsers = require("../models/premium.js");

module.exports = {
	name: "activate",
	async execute(ctx, sessions, awaitReply) {

		const tagName = ctx.from.id;

		const tag = await premUsers.findOne({
			ID: ctx.from.id,
		});
		if (tag) {
			return ctx.reply("❌ You already have Premium! If you'd like to buy another code for a friend, message @im2rnado");
		}

		const exist = await awaitReply.get(tagName);

		if (exist) {
			awaitReply.delete(tagName);
		}

		awaitReply.set(tagName, "activate");

		ctx.reply("Please reply with your activation within 5 minutes");
		setTimeout(stopInterval, 300000);

		function stopInterval() {
			awaitReply.delete(tagName);
		}
	},
};