require("dotenv").config();
const Auth = require("../libs/auth");

// Database
const deviceauth = require("../models/deviceauth.js");

module.exports = {
	name: "undo",
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

		awaitReply.set(tagName, "platform");

		const platforms = [
			"WeGame",
			"EpicPCKorea",
			"Epic",
			"EpicPC",
			"EpicAndroid",
			"PSN",
			"Live",
			"IOSAppStore",
			"Nintendo",
			"Samsung",
			"Shared",
		];

		ctx.reply(`Please reply with the platform name you want to set within 5 minutes\n\n*Valid Platforms*: ${platforms.join(" - ")}`, { parse_mode: "markdown" });
		setTimeout(stopInterval, 300000);

		function stopInterval() {
			awaitReply.delete(tagName);
		}
	},
};