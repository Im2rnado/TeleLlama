// Modules
const Auth = require("../libs/auth");
const Endpoints = require("../utils/endpoints");
const axios = require("axios").default;
const { Markup } = require("telegraf");

// Database
const deviceauth = require("../models/deviceauth.js");
const premUsers = require("../models/premium.js");

module.exports = {
	name: "unlink",
	async execute(ctx, sessions) {

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

		const linked = [];
		const accounts = [];

		await axios.get(`${Endpoints.DEVICE_AUTH}/${token.account_id}/externalAuths`, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).then((response) => {
			const arr = response.data;

			arr.forEach(el => {
				linked.push({ type: el.type, name: el.externalDisplayName });
			});

			console.log(linked);
		}).catch((err) => {
			console.error(err);
		});

		linked.forEach(el => {
			accounts.push(Markup.callbackButton(`${el.type.toUpperCase()}: ${el.name || "Not Specified"}`, el.type));
		});

		// Send the link
		ctx.reply(`${accounts.length ? "Please choose an account from below to unlink" : "You do not have any accounts linked"}`,
			Markup.inlineKeyboard(accounts).extra(),
		);
	},
};