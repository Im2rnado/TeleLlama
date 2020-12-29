/* eslint-disable no-inline-comments */
// Resources
require("dotenv").config();
const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");

// Modules
const axios = require("axios").default;

// Database
const deviceauth = require("../models/deviceauth.js");

module.exports = {
	name: "vbucks",
	async execute(ctx) {

		const tagName = ctx.from.id;

		const exist = await deviceauth.findOne({
			authorID: tagName,
		});

		if (exist) {

			const auth = new Auth();

			const token = await auth.login(null, tagName);
			console.log(token.access_token);
			const accountId = token.account_id;

			const response = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token.access_token}`,
			} }).catch((err) => {
				console.error(err);
				return ctx.reply(`An error has occured: ${err.response.data.errorMessage}`);
			});
			const mtxQantitys = { currency: 0 };
			const breakdown = [];
			const keys = Object.keys(response.data.profileChanges[0].profile.items);

			for (let i = 0; i < keys.length; i++) {
				const item = response.data.profileChanges[0].profile.items[keys[i]];

				if(item.templateId.includes("Currency")) {
					mtxQantitys.fullCurrency = mtxQantitys.currency += item.quantity;

					breakdown.push(`**${Number(item.quantity).toLocaleString()}** x **${item.attributes.platform || "Shared"} ${item.templateId.split(":")[1].replace("Mtx", "")}**`);
				}
			}

			return ctx.reply(`Total: *${mtxQantitys.fullCurrency ? mtxQantitys.fullCurrency.toLocaleString() : "0"} V-Bucks*\n\nBreadown:\n*${breakdown.length ? breakdown.join("\n") : "Not Found"}*`, { parse_mode: "markdown" });
		}
		else {
			return ctx.reply("❌ You are not logged in");
		}
	},
};