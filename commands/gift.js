/* eslint-disable no-inline-comments */
// Resources
require("dotenv").config();
const Auth = require("../libs/auth");

// Database
const deviceauth = require("../models/deviceauth.js");

module.exports = {
	name: "gift",
	async execute(ctx, sessions, awaitReply) {

		const tagName = ctx.from.id;

		const logged = await deviceauth.findOne({
			authorID: tagName,
		});

		if (logged) {
			const auth = new Auth();

			const onfo = await auth.login(null, tagName);
			console.log(onfo.access_token);
			sessions.set(tagName, onfo);
		}

		const token = await sessions.get(tagName);

		if (!token) {
			return ctx.reply("❌ You are not logged in");
		}

		const exists = await awaitReply.get(tagName);

		if (exists) {
			awaitReply.delete(tagName);
		}

		awaitReply.set(tagName, "gift");

		ctx.reply("Please reply with the item name you want to gift within 5 minutes");
		setTimeout(stopInterval, 300000);

		async function stopInterval() {
			const h = await awaitReply.get(tagName);
			if (h == "gift") {
				awaitReply.delete(tagName);
			}
		}
	},
};