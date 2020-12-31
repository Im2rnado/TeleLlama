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
	name: "daily",
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

		const response = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/ClaimLoginReward?profileId=campaign&rvn=-1`, {}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).catch((err) => {
			console.error(err);
			return ctx.reply("❌ You do not own STW!");
		});
		const notification = response.data.notifications[0];
		console.log(notification);

		const items = notification.items;

		if (items.length === 0) {
			return ctx.reply(`You have already claimed today's reward!\n\n*Days Logged in*: ${notification.daysLoggedIn}`, { parse_mode: "markdown" });
		}

		let reward = notification.items[0].itemType;
		const quan = notification.items[0].quantity;

		if (reward === "Currency:MtxComplimentary") reward = "V-Bucks";
		if (reward === "CardPack:cardpack_bronze") reward = "Upgrade Llama";
		if (reward === "AccountResource:voucher_basicpack") reward = "Mini Llama";
		if (reward === "AccountResource:reagent_c_t02") reward = "Lightning in a Bottle";
		if (reward === "AccountResource:reagent_c_t01") reward = "Pure Drop of Rain";
		if (reward === "CardPack:cardpack_hero_r") reward = "Rare Hero";
		if (reward === "AccountResource:eventcurrency_scaling") reward = "Gold";

		return ctx.reply(`✅ Successfully Claimed Daily Reward\n\n*Days Logged in*: ${notification.daysLoggedIn}\n*Claimed*: ${quan} x ${reward}`, { parse_mode: "markdown" });
	},
};