const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");
const axios = require("axios").default;
const moment = require("moment");

// Database
const deviceauth = require("../models/deviceauth.js");
const premUsers = require("../models/premium.js");

module.exports = {
	name: "gifthistory",
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

		const shop = (await axios.get("https://api.carbidebot.com/shop/combined")).data.br;
		const response = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).catch((err) => {
			console.error(err);
			return ctx.reply(`An error has occured: ${err.response.data.errorMessage}`);
		});

		const sent = response.data.profileChanges[0].profile.stats.attributes.gift_history.num_sent;
		const receive = response.data.profileChanges[0].profile.stats.attributes.gift_history.num_received;

		const history = response.data.profileChanges[0].profile.stats.attributes.gift_history.gifts;

		let fembed = [];

		if (!history.length) {
			fembed = "No Gifts Found";
		}
		else {
			await Promise.all(
				history.map(async (el) => {
					let from;

					try {
						from = await getDisplayName(el.toAccountId, token.access_token);
					}
					catch {
						from = el.toAccountId;
					}

					fembed.push(`Gifted *${!(shop.find(eli => eli.offer == el.offerId)) ? "Item not in today's item stop" : (shop.find(eli => eli.offer == el.offerId)).name}* to *${from}* on *${moment.utc(el.date).format("dddd, MMMM Do YYYY, HH:mm")}*`);
				}),
			);
		}

		console.log(fembed);

		if (!tag) {
			fembed = "❌ To view this, purchase an Activation code from any of our admins:\n• @im2rnado - BTC\n• @dingus69 - PayTM \n• @ehdan69 CashApp, PayPal, PayTM!";
		}

		return ctx.reply(`Total Sent: *${!sent ? "0" : sent}*\nTotal Received: *${!receive ? "0" : receive}*\n\n*Past Week:*\n${fembed}`, { parse_mode: "markdown" });
	},
};

async function getDisplayName(accountId, token) {

	const displayName = await axios.get(`${Endpoints.DEVICE_AUTH}/${accountId}`, { headers: {
		"Content-Type": "application/json",
		"Authorization": `Bearer ${token}`,
	} }).catch((err) => {
		console.error(err);
	});

	return displayName.data.displayName;
}