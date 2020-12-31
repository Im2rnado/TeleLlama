require("dotenv").config();
const Auth = require("../libs/auth");
const Endpoints = require("../utils/endpoints");
const axios = require("axios").default;

// Database
const deviceauth = require("../models/deviceauth.js");

module.exports = {
	name: "undo",
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

		const response = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/QueryProfile?profileId=common_core`, {}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).catch((err) => {
			console.error(err);
			return ctx.reply(`An error has occured: ${err.response.data.errorMessage}`);
		});

		const arr = response.data.profileChanges[0].profile.stats.attributes.mtx_purchase_history.purchases;

		if (!arr.length) return ctx.reply("Welp, looks like you don't have any purchases :/");

		const lastNumber = arr[arr.length - 1];
		const itemid = lastNumber.lootResult[0].itemType;

		await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/RefundMtxPurchase?profileId=common_core`, {
			"purchaseId": `${lastNumber.purchaseId}`,
			"quickReturn": true,
		}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).then((respons) => {
			console.log(respons);
			ctx.reply(`✅ Undoing Last Purchase was Successful\n\nRefunded: *${itemid.split(":")[1]}*`);
		}).catch((err) => {
			console.error(err);
			return ctx.reply("❌ Could not undo last purchase");
		});
	},
};