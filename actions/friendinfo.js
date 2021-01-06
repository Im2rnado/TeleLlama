const deviceauth = require("../models/deviceauth.js");
const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");
const axios = require("axios").default;
const moment = require("moment");

module.exports = {
	name: "friendinfo",
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

			const accId = await sessions.get(`${tagName}-friend`);

			const reponse7 = await axios.get(`${Endpoints.FRIENDS_URL}/v1/${token.account_id}/summary?displayNames=true`, { headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token.access_token}`,
			} }).catch((err) => {
				console.error(err);
				return ctx.reply(`❌ An error occured: ${err.response.data.errorMessage}`);
			});

			const featured = reponse7.data.friends;

			const fembee = [];

			if (!featured.length) return ctx.reply("Welp, looks like you don't have any friends :/");

			featured.forEach(el => {
				if (el.displayName) {
					fembee.push(el);
				}
			});

			const him = fembee.find(i => i.accountId == accId.id);
			if(!him) return ctx.reply("Welp, looks like you don't have any friends with that name :/");

			// const y = Date.now() - moment.utc(him.created);
			// const joined = Math.floor(y / 86400000);

			const now = +new Date();
			const createdAt = +moment.utc(him.created);

			const oneDay = 60 * 60 * 48 * 1000;
			const compareDatesBoolean = (now - createdAt) > oneDay;

			let pass = "";
			if (compareDatesBoolean) { pass = "Yes"; }
			else { pass = "No"; }
			try {
				ctx.reply(`*Display Name*: ${him.displayName}\n*Account ID*: ${him.accountId}\n*Added On*: ${moment.utc(him.created).format("dddd, MMMM Do YYYY, HH:mm")}\n*48 Hours Passed*? ${pass}`, { parse_mode: "markdown" });
			}
			catch {
				ctx.reply(`Display Name: ${him.displayName}\nAccount ID: ${him.accountId}\nAdded On: ${moment.utc(him.created).format("dddd, MMMM Do YYYY, HH:mm")}\n48 Hours Passed? ${pass}`);
			}
		}
		catch(err) {
			console.error(err);
			return ctx.reply(`❌ You encountered an error\n\n${err}`);
		}
	},
};