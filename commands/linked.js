/* eslint-disable no-inline-comments */
// Resources
require("dotenv").config();
const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");

// Modules
const axios = require("axios").default;
const moment = require("moment");

// Database
const deviceauth = require("../models/deviceauth.js");
const premUsers = require("../models/premium.js");

module.exports = {
	name: "linked",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

		const tag = await premUsers.findOne({
			ID: ctx.from.id,
		});

		try {

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

			const response = await axios.get(`${Endpoints.DEVICE_AUTH}/${token.account_id}/externalAuths`, { headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token.access_token}`,
			} }).catch((err) => {
				console.error(err);
				return ctx.reply(`An error has occured: ${err.response.data.errorMessage}`);
			});

			const keys = response.data;

			const embed = [];

			if(!keys.length) embed.push("None");

			keys.forEach(el => {
				embed.push(`Type: ${el.type}\nName: ${el.externalDisplayName}\nAdded On: ${moment.utc(el.dateAdded).format("dddd, MMMM Do YYYY, HH:mm:ss")}`);
			});

			if (!tag) {
				ctx.reply(`Linked Accounts\n\n${embed[0]}`, { parse_mode: "markdown" });
				return ctx.reply("❌ This is just one account, to view all of them, purchase an Activation code from any of our admins:\n\n• @im2rnado - BTC\n• @sxlar_sells - CashApp\n• @dingus69 - PayTM\n• @ehdan69 CashApp, PayPal, PayTM!");
			}
			embed.forEach(el => {
				ctx.reply(el);
			});

		}
		catch(err) {
			console.error(err);
			return ctx.reply(`❌ You encountered an error\n\n${err}`);
		}
	},
};