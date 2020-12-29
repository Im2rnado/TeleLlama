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
	async execute(ctx) {

		const tagName = ctx.from.id;

		const tag = await premUsers.findOne({
			ID: ctx.from.id,
		});

		const exist = await deviceauth.findOne({
			authorID: tagName,
		});

		if (exist) {

			const auth = new Auth();

			const token = await auth.login(null, tagName);
			console.log(token.access_token);
			const accountId = token.account_id;

			const response = await axios.get(`${Endpoints.DEVICE_AUTH}/${accountId}/deviceAuth`, { headers: {
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
				return ctx.reply("❌ This is just one device, to view all of them, purchase an Activation code from @im2rnado first!");
			}

			return ctx.reply(`*Logged in devices*\n\n\n${embed.join("\n\n")}`, { parse_mode: "markdown" });
		}
		else {
			return ctx.reply("❌ You are not logged in");
		}
	},
};