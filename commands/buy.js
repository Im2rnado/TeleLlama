/* eslint-disable no-inline-comments */
// Resources
require("dotenv").config();
const Auth = require("../libs/auth");

// Database
const deviceauth = require("../models/deviceauth.js");

module.exports = {
	name: "buy",
	async execute(ctx, sessions, awaitReply) {

		const tagName = ctx.from.id;

		const exist = await sessions.get(tagName);

		if (!exist) {
			const logged = await deviceauth.findOne({
				authorID: tagName,
			});

			if (!logged) {
				return ctx.reply("❌ You are not logged in");
			}

			const auth = new Auth();

			const token = await auth.login(null, tagName);
			console.log(token.access_token);
			sessions.set(tagName, token);
		}

		const exists = await awaitReply.get(tagName);

		if (exists) {
			awaitReply.delete(tagName);
		}

		awaitReply.set(tagName, "buy");

		ctx.reply("Please reply with the item name you want to purchase within 5 minutes");
		setTimeout(stopInterval, 300000);

		function stopInterval() {
			awaitReply.delete(tagName);
		}
	},
};