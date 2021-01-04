const deviceauth = require("../models/deviceauth.js");
const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");
const axios = require("axios").default;

module.exports = {
	name: "friendrem",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

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

		const accId = await sessions.get(`${tagName}-friend`);

		await axios.delete(`${Endpoints.FRIENDS_URL}/public/friends/${token.account_id}/${accId.id}`, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).then((response) => {
			console.log(response);

			ctx.reply(`✅ Successfully removed *${accId.displayName}*`, { parse_mode: "markdown" });
		}).catch((err) => {
			console.error(err);
			return ctx.reply(`❌ ${err.response.data.errorMessage}`);
		});
	},
};