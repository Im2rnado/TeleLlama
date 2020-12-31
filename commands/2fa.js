/* eslint-disable no-inline-comments */
// Resources
require("dotenv").config();
const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");

// Modules
const axios = require("axios").default;
const { Markup } = require("telegraf");

// Database
const deviceauth = require("../models/deviceauth.js");
const premUsers = require("../models/premium.js");

module.exports = {
	name: "2fa",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

		const tag = await premUsers.findOne({
			ID: ctx.from.id,
		});
		if (!tag) {
			return ctx.reply("❌ This command is not free, purchase an Activation code from @im2rnado first!");
		}

		const exist = await sessions.get(tagName);

		let token = exist;

		if (!exist) {
			const logged = await deviceauth.findOne({
				authorID: tagName,
			});

			if (!logged) {
				return ctx.reply("❌ You are not logged in");
			}

			const auth = new Auth();

			token = await auth.login(null, tagName);
			console.log(token.access_token);
			sessions.set(tagName, token);
		}

		await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/ClaimMfaEnabled?profileId=common_core`, {
			"bClaimForStw": false,
		}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).then((respons) => {
			console.log(respons);
			return ctx.reply("✅ Successfuly Claimed Boogie Down");
		}).catch((err) => {
			console.error(err);
			return ctx.reply("❌ Please enable 2FA from the link below first", Markup.inlineKeyboard([
				Markup.urlButton("Epic Games", "https://www.epicgames.com/account/password"),
			]).extra(),
			);
		});
	},
};