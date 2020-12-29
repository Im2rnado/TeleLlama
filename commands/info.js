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
	name: "info",
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

			const response = await axios.get(`${Endpoints.DEVICE_AUTH}/${accountId}`, { headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token.access_token}`,
			} }).catch((err) => {
				console.error(err);
				return ctx.reply(`An error has occured: ${err.response.data.errorMessage}`);
			});

			const id = response.data.id;
			const displayname = response.data.displayName;
			let fname = response.data.name;
			const email = response.data.email;
			let lastlogin = response.data.lastLogin;
			let dischanges = response.data.numberOfDisplayNameChanges;
			let country = response.data.country;
			const lname = response.data.lastName;
			const pnumber = response.data.phoneNumber;
			const canupdaten = response.data.canUpdateDisplayName;
			let canupdatenext = response.data.canUpdateDisplayNameNext;
			let tfa = response.data.tfaEnabled;
			const ever = response.data.emailVerified;

			if (!tag) {
				fname = "*".repeat(fname.length);
				lastlogin = "*".repeat(lastlogin.length);
				dischanges = "*".repeat(dischanges.toString().length);
				country = "*".repeat(country.length);
				canupdatenext = "*".repeat(canupdatenext.length);
				tfa = "*****";
			}

			ctx.reply(`*${displayname}*'s Info\n\n*Account ID*: ${id}\n*Real Name*: ${fname} ${lname}\n*Email*: ${email}\n*Phone Number*: ${!pnumber ? "No Phone Number" : pnumber}\n*Account Country*: ${country}\n*Last Login*: ${moment.utc(lastlogin).format("dddd, MMMM Do YYYY, HH:mm")}\n*Display Name Changes*: ${dischanges}\n*Can update Display Name*? ${!canupdaten == true ? `${canupdaten}, ${moment.utc(canupdatenext).format("dddd, MMMM Do YYYY, HH:mm:ss")}` : canupdaten }\n*Email Verified*? ${ever}\n*2FA On*? ${tfa}`, { parse_mode: "markdown" });

			if (!tag) {
				ctx.reply("❌ To view all the info, purchase an Activation code from @im2rnado first!");
			}
		}
		else {
			return ctx.reply("❌ You are not logged in");
		}
	},
};