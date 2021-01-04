/* eslint-disable no-inline-comments */
// Resources
require("dotenv").config();

// Modules
const axios = require("axios").default;
const { stringify } = require("querystring");
const { Markup } = require("telegraf");

// Database
const deviceauth = require("../models/deviceauth.js"),
	deviceauth1 = require("../models/deviceauth1.js"),
	deviceauth2 = require("../models/deviceauth2.js"),
	deviceauth3 = require("../models/deviceauth3.js"),
	deviceauth4 = require("../models/deviceauth4.js"),
	deviceauth5 = require("../models/deviceauth5.js");

module.exports = {
	name: "login",
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

		// Generate Device Code
		console.log("[AUTH]", "Requesting Access Token");
		const access_token = await axios.post("https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token", stringify({ token_type: "eg1", grant_type: "client_credentials" }), { headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": "Basic NTIyOWRjZDNhYzM4NDUyMDhiNDk2NjQ5MDkyZjI1MWI6ZTNiZDJkM2UtYmY4Yy00ODU3LTllN2QtZjNkOTQ3ZDIyMGM3",
		} }).catch((err) => {
			console.error(err.response.data.errorMessage);
			ctx.reply(err.response.data.errorMessage);
		});

		console.log("[AUTH]", "Requesting Device Code");
		const tempAccessToken = await axios.post("https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/deviceAuthorization", stringify({ prompt: "login" }), {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Bearer ${access_token.data.access_token}`,
			},
		}).then((res) => {
			return res.data;
		}).catch((err) => {
			console.error(err.response.data.errorMessage);
			ctx.reply(err.response.data.errorMessage);
		});
		console.log(tempAccessToken);

		// Send the link
		ctx.reply("Press the button below to login",
			Markup.inlineKeyboard([
				Markup.urlButton("Login", tempAccessToken.verification_uri_complete),
			]).extra(),
		);

		const b = setInterval(myCallback, 3000); // 3 seconds
		setTimeout(stopInterval, 100000); // 100 Seconds

		function stopInterval() {
			clearInterval(b);
			return ctx.reply("❌ Login Cancelled");
		}

		async function myCallback() {
			const token = await axios.post("https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token", stringify({ grant_type: "device_code", device_code: tempAccessToken.device_code }), { headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": "Basic NTIyOWRjZDNhYzM4NDUyMDhiNDk2NjQ5MDkyZjI1MWI6ZTNiZDJkM2UtYmY4Yy00ODU3LTllN2QtZjNkOTQ3ZDIyMGM3",
			} });
			if (token.data && token.data.access_token) {
				console.log(token);
				clearInterval(b);

				if (exists && token.data.account_id == exists.accountId) return ctx.reply("❌ You can't login to the same account twice!");
				else if (exists2 && token.data.account_id == exists2.accountId) return ctx.reply("❌ You can't login to the same account twice!");
				else if (exists3 && token.data.account_id == exists3.accountId) return ctx.reply("❌ You can't login to the same account twice!");
				else if (exists4 && token.data.account_id == exists4.accountId) return ctx.reply("❌ You can't login to the same account twice!");
				else if (exists5 && token.data.account_id == exists5.accountId) return ctx.reply("❌ You can't login to the same account twice!");

				const accountId = token.data.account_id;
				const display1 = token.data.displayName;

				ctx.reply(`👋 Welcome, ${display1}!\n\nAccount ID\n${accountId}`,
					Markup.inlineKeyboard([
						Markup.callbackButton("➡️ Get Account Info", "ACCINFO"),
					]).extra(),
				);

				sessions.set(tagName, token.data);
				setTimeout(async function() {
					await sessions.delete(tagName);
				}, 28800000);
				return console.log("Logged in");
			}
		}
	},
};