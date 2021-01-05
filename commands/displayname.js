const Auth = require("../libs/auth");
const deviceauth = require("../models/deviceauth.js");
const premUsers = require("../models/premium.js");

module.exports = {
	name: "displayname",
	async execute(ctx, sessions, awaitReply) {

		const tagName = ctx.from.id;

		const tag = await premUsers.findOne({
			ID: ctx.from.id,
		});
		if (!tag) {
			return ctx.reply("❌ This command is not free, purchase an Activation code from any of our admins:\n• @im2rnado - BTC\n• @sxlar_sells - CashApp\n• @dingus69 - PayTM \n• @ehdan69 CashApp, PayPal, PayTM!");
		}

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

		awaitReply.set(tagName, "name");

		ctx.reply("Please reply with the new display name you would like to set within 5 minutes");
		setTimeout(stopInterval, 300000);

		async function stopInterval() {
			const h = await awaitReply.get(tagName);
			if (h == "name") {
				awaitReply.delete(tagName);
			}
		}
	},
};