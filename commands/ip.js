/* eslint-disable no-inline-comments */
// Resources
require("dotenv").config();
const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");

// Modules
const axios = require("axios").default;

// Database
const deviceauth = require("../models/deviceauth.js");
const premUsers = require("../models/premium.js");

module.exports = {
	name: "ip",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

		const tag = await premUsers.findOne({
			ID: ctx.from.id,
		});

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

		const response = await axios.get(`${Endpoints.DEVICE_AUTH}/${token.account_id}/deviceAuth`, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).catch((err) => {
			console.error(err);
			return ctx.reply(`An error has occured: ${err.response.data.errorMessage}`);
		});

		const keys = response.data;

		const embed = [];

		keys.forEach(el => {
			embed.push(`Device ID: *${el.deviceId}*\nCreated at: *${el.created.location}*\nIP Address: *${el.created.ipAddress}*`);
		});

		if (!tag) {
			ctx.reply(`*Logged in devices*\n\n${embed[0]}`, { parse_mode: "markdown" });
			return ctx.reply("❌ This is just one device, to view all of them, purchase an Activation code from any of our admins:\n• @im2rnado - BTC\n• @sxlar_sells - CashApp\n• @dingus69 - PayTM \n• @ehdan69 CashApp, PayPal, PayTM!");
		}

		return ctx.reply(`*Logged in devices*\n\n\n${embed.join("\n\n") || "You do not have any IPs associated with this account"}`, { parse_mode: "markdown" });
	},
};