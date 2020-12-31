const deviceauth = require("./models/deviceauth.js"),
	deviceauth2 = require("./models/deviceauth2.js");

const { Markup } = require("telegraf");
const Auth = require("../libs/auth");

module.exports = {
	name: "acc2",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

		// Fetches current logged in account
		const exist = await deviceauth.findOne({
			authorID: tagName,
		});

		if (exist) {
			await deviceauth.findOneAndDelete({
				authorID: tagName,
			});
		}

		// Gets saved accounts
		const exists = await deviceauth2.findOne({
			authorID: tagName,
		});

		const newData2 = new deviceauth({
			authorID: tagName,
			accountId: exists.accountId,
			deviceId: exists.deviceId,
			secret: exists.secret,
		});
		await newData2.save();

		const auth = new Auth();

		const token = await auth.login(null, tagName);
		console.log(token.access_token);

		await sessions.set(tagName, token);

		ctx.reply(`👋 Welcome, ${token.displayName}!\n\nAccount ID\n${token.account_id}`,
			Markup.inlineKeyboard([
				Markup.callbackButton("➡️ Get Account Info", "ACCINFO"),
			]).extra(),
		);

		if(token.displayName !== exists.displayName) {
			await deviceauth2.findOneAndDelete({
				authorID: tagName,
			});

			const newData = new deviceauth2({
				authorID: tagName,
				accountId: exists.accountId,
				deviceId: exists.deviceId,
				secret: exists.secret,
				displayname: token.displayName,
			});
			await newData.save();
		}
	},
};