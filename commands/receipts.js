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

module.exports = {
	name: "receipts",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

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

		const response = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).catch((err) => {
			console.error(err);
			return ctx.reply(`An error has occured: ${err.response.data.errorMessage}`);
		});
		let fembed = [];

		const sent = response.data.profileChanges[0].profile.stats.attributes.in_app_purchases.receipts;

		if (!sent.length) {
			return ctx.reply("No Receipts Found");
		}
		else {
			await sent.forEach(el => {
				fembed.push(el.split(":").join(" - "));
			});
			await axios.post("https://paste.mod.gg/documents", `${token.displayName}'s Receipts\n\n${fembed.join("\n")}`, { headers: {
				"Content-Type": "application/json",
				"Charset": "UTF-8",
			} }).then(code => {
				fembed = `https://paste.mod.gg/${code.data.key}`;
				console.log(fembed);
			}).catch(err => {
				console.log(err);
			});

			ctx.reply(`${sent.length} Receipts. Open the link below to view them`,
				Markup.inlineKeyboard([
					Markup.urlButton("Receipts Breadown", fembed),
				]).extra(),
			);
		}
	},
};