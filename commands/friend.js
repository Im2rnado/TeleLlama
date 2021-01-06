const Auth = require("../libs/auth");
const deviceauth = require("../models/deviceauth.js");

module.exports = {
	name: "friend",
	async execute(ctx, sessions, awaitReply) {

		const tagName = ctx.from.id;

		try {

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

			awaitReply.set(tagName, "friend");

			ctx.reply("Please reply with the username you would like to add/remove/get info within 5 minutes");
			setTimeout(async function() {
				const h = await awaitReply.get(tagName);
				if (h == "friend") {
					awaitReply.delete(tagName);
				}
			}, 300000);
		}
		catch(err) {
			console.error(err);
			return ctx.reply(`❌ You encountered an error\n\n${err}`);
		}
	},
};