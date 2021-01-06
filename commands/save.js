/* eslint-disable no-inline-comments */
// Resources
require("dotenv").config();
const Endpoints = require("../utils/endpoints");
const tokens = require("../utils/tokens");

// Modules
const axios = require("axios").default;
const { stringify } = require("querystring");
const { Markup } = require("telegraf");

// Database
const deviceauth1 = require("../models/deviceauth1.js"),
	deviceauth2 = require("../models/deviceauth2.js"),
	deviceauth3 = require("../models/deviceauth3.js"),
	deviceauth4 = require("../models/deviceauth4.js"),
	deviceauth5 = require("../models/deviceauth5.js");

module.exports = {
	name: "save",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

		try {

			const exist = await sessions.get(tagName);

			// Gets saved accounts
			const exists = await deviceauth1.findOne({
				authorID: tagName,
			});
			const exists2 = await deviceauth2.findOne({
				authorID: tagName,
			});
			const exists3 = await deviceauth3.findOne({
				authorID: tagName,
			});
			const exists4 = await deviceauth4.findOne({
				authorID: tagName,
			});
			const exists5 = await deviceauth5.findOne({
				authorID: tagName,
			});

			// If 5 saved accounts
			if (exists5) return ctx.reply("❌ You already have 5 saved accounts!");

			if (exist) {

				if (exists && exist.account_id == exists.accountId) return ctx.reply("❌ You can't save the same account twice!");
				else if (exists2 && exist.account_id == exists2.accountId) return ctx.reply("❌ You can't save the same account twice!");
				else if (exists3 && exist.account_id == exists3.accountId) return ctx.reply("❌ You can't save the same account twice!");
				else if (exists4 && exist.account_id == exists4.accountId) return ctx.reply("❌ You can't save the same account twice!");
				else if (exists5 && exist.account_id == exists5.accountId) return ctx.reply("❌ You can't save the same account twice!");

				const token = exist;
				let hexchangeCode;

				console.log("[AUTH]", "Requesting Exchange");
				await axios.get(Endpoints.OAUTH_EXCHANGE, {
					headers: {
						Authorization: `Bearer ${token.access_token}`,
					},
				}).then((res) => {
					hexchangeCode = res.data.code;
				});

				console.log("[AUTH]", "Requesting OAUTH Token");
				const iosToken = await axios
					.post(Endpoints.OAUTH_TOKEN, stringify({ grant_type: "exchange_code", exchange_code: hexchangeCode }), {
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
							Authorization: `Basic ${tokens.ios_token}`,
						},
						responseType: "json",
					})
					.then((res) => {
						return res.data;
					}).catch(err => {
						console.log(err);
					});

				const deviceAuthDetails = await axios.post(`${Endpoints.DEVICE_AUTH}/${iosToken.account_id}/deviceAuth`, {}, {
					headers: {
						Authorization: `Bearer ${iosToken.access_token}`,
					},
					responseType: "json",
				}).then((res) => {
					return res.data;
				}).catch(err => {
					console.log(err);
				});

				const accountId = token.account_id;
				const display1 = token.displayName;

				ctx.reply(`👋 Saved ${display1}!\n\nAccount ID\n${accountId}`,
					Markup.inlineKeyboard([
						Markup.callbackButton("➡️ Get Account Info", "ACCINFO"),
					]).extra(),
				);

				let devv = "";

				if (!exists) devv = deviceauth1;
				else if (!exists2) devv = deviceauth2;
				else if (!exists3) devv = deviceauth3;
				else if (!exists4) devv = deviceauth4;
				else if (!exists5) devv = deviceauth5;

				const newData = new devv({
					authorID: tagName,
					accountId: deviceAuthDetails.accountId,
					deviceId: deviceAuthDetails.deviceId,
					secret: deviceAuthDetails.secret,
					displayname: token.displayName,
				});
				await newData.save();
			}
			else {
				return ctx.reply("❌ You are not logged in");
			}
		}
		catch(err) {
			console.error(err);
			return ctx.reply(`❌ You encountered an error\n\n${err}`);
		}
	},
};