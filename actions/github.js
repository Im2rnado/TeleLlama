const deviceauth = require("../models/deviceauth.js");

const Auth = require("../libs/auth");
const axios = require("axios").default;

module.exports = {
	name: "github",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

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

			await axios.delete(`https://account-public-service-prod03.ol.epicgames.com/account/api/public/account/${token.account_id}/externalAuths/github`, { headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token.access_token}`,
			} }).then((response) => {
				console.error(response.data);

				ctx.reply("✅ Successfully Unlinked *Github*", { parse_mode: "markdown" });
			}).catch((err) => {
				console.error(err);
				return ctx.reply(`❌ ${err.response.data.errorMessage}`);
			});
		}
		catch(err) {
			console.error(err);
			return ctx.reply(`❌ You encountered an error\n\n${err}`);
		}
	},
};