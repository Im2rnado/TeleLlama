/* eslint-disable no-inline-comments */

// Resources
require("dotenv").config();
const Collection = require("@discordjs/collection");
const Endpoints = require("./utils/endpoints");
const fortniteShop = require("./libs/fortniteShop");

// Modules
const axios = require("axios").default;
const mongoose = require("mongoose");
const fs = require("fs");
const { stringify } = require("querystring");
const moment = require("moment");
const Telegraf = require("telegraf");
const { Markup } = require("telegraf");
const app = new Telegraf(process.env.BOT_TOKEN);
const sessions = new Collection();
const awaitReply = new Collection();

// Database
const premUsers = require("./models/premium.js"),
	codes = require("./models/activation.js");

fs.readdirSync(`${__dirname}/commands/`).forEach(file => {
	const command = require(`${__dirname}/commands/${file}`);

	if (command.name) {
                try {
		        app.command(command.name, ctx => {
			        command.execute(ctx, sessions, awaitReply);
		        });
                }
                catch(e) {
			console.error(e);
			ctx.reply(`❌ An error has occurred: ${e}`);
		}
	}
});

fs.readdirSync(`${__dirname}/actions/`).forEach(file => {
	const action = require(`${__dirname}/actions/${file}`);

	if (action.name) {
                try {
		        app.action(action.name, ctx => {
			        action.execute(ctx, sessions, awaitReply);
		        });
                }
                catch(e) {
			console.error(e);
			ctx.reply(`❌ An error has occurred: ${e}`);
		}
	}
});

app.telegram.getMe().then(async (bot_informations) => {
	await mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
		console.log("Connected to the MongoDB Database.");
	}).catch((err) => {
		console.log("Unable to connect to the MongoDB Database. Error:" + err);
	});
	fortniteShop.init();
	app.options.username = bot_informations.username;
	console.log("Server has initialized bot nickname. Nick: " + bot_informations.username);
});

app.on("text", async (ctx) => {
	const tagName = ctx.from.id;

	const what = awaitReply.get(tagName);

	if (what == "activate") {
		console.log(ctx.message.text);
		const works = await codes.findOne({
			ID: ctx.message.text,
		});
		if (!works) {
			awaitReply.delete(tagName);
			return ctx.reply("❌ This code does not exist!");
		}

		await codes.findOneAndDelete({
			ID: ctx.message.text,
		});

		const newData = new premUsers({
			ID: tagName,
		});
		newData.save();

		ctx.reply("✅ Successfully Activated Premium!");
		awaitReply.delete(tagName);
	}
	else if (what == "buy") {
		const works = await sessions.get(tagName);
		if (!works) {
			awaitReply.delete(tagName);
			return ctx.reply("❌ You are not logged in!");
		}

		const cosmetics = await axios.get("https://api.carbidebot.com/shop/combined");

		const featured = cosmetics.data.br;

		let item = featured.find(i => i.name.toLowerCase() === ctx.message.text.toLowerCase());
		if (!isNaN(ctx.message.text) && !item) {
			const number = ctx.message.text - 1;
			item = featured[number];
		}
		if (item) {
			awaitReply.delete(tagName);
			sessions.set(`${tagName}-buy`, item);
			ctx.reply("Are you sure you would like to purchase this item?",
				Markup.inlineKeyboard([Markup.callbackButton("Yes, continue", "purchase")]).extra(),
			);
		}
		else {
			awaitReply.delete(tagName);
			return ctx.reply(`❌ *Item Not Found!*\n\nIt looks like there isn't any item with the name *${ctx.message.text}*\nUse /shop to get today's Item Shop.`, { parse_mode: "markdown" });
		}
	}
	else if (what == "gift") {
		const works = await sessions.get(tagName);
		if (!works) {
			awaitReply.delete(tagName);
			return ctx.reply("❌ You are not logged in!");
		}

		const cosmetics = await axios.get("https://api.carbidebot.com/shop/combined");

		const featured = cosmetics.data.br;

		let item = featured.find(i => i.name.toLowerCase() === ctx.message.text.toLowerCase());
		if (!isNaN(ctx.message.text) && !item) {
			const number = ctx.message.text - 1;
			item = featured[number];
		}
		if (item) {
			awaitReply.delete(tagName);

			awaitReply.set(tagName, "giftuser");
			sessions.set(`${tagName}-gift`, item);

			ctx.reply("Please reply with the user name you want to gift within 5 minutes");
			setTimeout(function() {
				awaitReply.delete(tagName);
			}, 300000);
		}
		else {
			awaitReply.delete(tagName);
			return ctx.reply(`❌ *Item Not Found!*\n\nIt looks like there isn't any item with the name *${ctx.message.text}*\nUse /shop to get today's Item Shop.`, { parse_mode: "markdown" });
		}
	}
	else if (what == "giftuser") {
		const works = await sessions.get(tagName);
		if (!works) {
			awaitReply.delete(tagName);
			return ctx.reply("❌ You are not logged in!");
		}

		const reponse7 = await axios.get(`${Endpoints.DEVICE_AUTH}/displayName/${encodeURI(ctx.message.text)}`, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${works.access_token}`,
		} }).catch((err) => {
			console.error(err);
			awaitReply.delete(tagName);
			return ctx.reply("❌ There is no user with this name!");
		});

		if(!reponse7.data.id) return ctx.reply("❌ There is no user with this name!");

		const accId = reponse7.data;

		sessions.set(`${tagName}-giftuser`, accId);
		awaitReply.delete(tagName);
		ctx.reply("Are you sure you would like to gift this item?",
			Markup.inlineKeyboard([Markup.callbackButton("Yes, continue", "gift")]).extra(),
		);
	}
	else if (what == "friend") {
		const works = await sessions.get(tagName);
		if (!works) {
			awaitReply.delete(tagName);
			return ctx.reply("❌ You are not logged in!");
		}
		const gh = await sessions.get(`${tagName}-friend`);
		if (gh) await sessions.delete(`${tagName}-friend`);

		const reponse7 = await axios.get(`${Endpoints.DEVICE_AUTH}/displayName/${encodeURI(ctx.message.text)}`, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${works.access_token}`,
		} }).catch((err) => {
			console.error(err);
			awaitReply.delete(tagName);
			return ctx.reply("❌ There is no user with this name!");
		});

		const accId = reponse7.data;

		const h = [Markup.callbackButton("Add Friend", "friendadd"), Markup.callbackButton("Remove Friend", "friendrem"), Markup.callbackButton("Get Info", "friendinfo")];

		sessions.set(`${tagName}-friend`, accId);
		ctx.reply(`Please choose what you would like to do to ${accId.displayName || accId.id}`,
			Markup.inlineKeyboard(h).extra(),
		);
		awaitReply.delete(tagName);
	}
	else if (what == "platform") {
		const works = await sessions.get(tagName);
		if (!works) {
			awaitReply.delete(tagName);
			return ctx.reply("❌ You are not logged in!");
		}

		const platform = [
			"WeGame",
			"EpicPCKorea",
			"Epic",
			"EpicPC",
			"EpicAndroid",
			"PSN",
			"Live",
			"IOSAppStore",
			"Nintendo",
			"Samsung",
			"Shared",
		];

		const platforms = {
			wegame: "WeGame",
			epicpckorea: "EpicPCKorea",
			epic: "Epic",
			epicpc: "EpicPC",
			epicandroid: "EpicAndroid",
			psn: "PSN",
			live: "Live",
			iosappstore: "IOSAppStore",
			nintendo: "Nintendo",
			samsung: "Samsung",
			shared: "Shared",
		};

		if (!(ctx.message.text.toLowerCase() === "wegame" || ctx.message.text.toLowerCase() === "epicpckorea" || ctx.message.text.toLowerCase() === "epic" || ctx.message.text.toLowerCase() === "epicpc" || ctx.message.text.toLowerCase() === "epicandroid" || ctx.message.text.toLowerCase() === "psn" || ctx.message.text.toLowerCase() === "live" || ctx.message.text.toLowerCase() === "iosappstore" || ctx.message.text.toLowerCase() === "nintendo" || ctx.message.text.toLowerCase() === "samsung" || ctx.message.text.toLowerCase() === "shared")) {
			awaitReply.delete(tagName);
			return ctx.reply(`❌ Wrong Usage\n\n*Valid Platforms*: ${platform.join(" - ")}`, { parse_mode: "markdown" });
		}

		await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${works.account_id}/client/SetMtxPlatform?profileId=common_core`, {
			"newPlatform": platforms[ctx.message.text.toLowerCase()],
		}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${works.access_token}`,
		} }).then((response) => {
			console.log(response.data);

			ctx.reply(`✅ Successfully changed V-Bucks Platform to *${platforms[ctx.message.text.toLowerCase()]}*\n\nUse /vbucks to see your V-Bucks`, { parse_mode: "markdown" });
			awaitReply.delete(tagName);
		}).catch((err) => {
			console.error(err);
			awaitReply.delete(tagName);
			return ctx.reply(`An error has occured: ${err.response.data.errorMessage}`);
		});
	}
	else if (what == "name") {
		const works = await sessions.get(tagName);
		if (!works) {
			awaitReply.delete(tagName);
			return ctx.reply("❌ You are not logged in!");
		}

		const response3 = await axios.post(Endpoints.OAUTH_TOKEN, stringify({ "grant_type": "token_to_token", "access_token": works.access_token }), { headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": "Basic ZWZlM2NiYjkzODgwNGM3NGIyMGUxMDlkMGVmYzE1NDg6NmUzMWJkYmFlNmE0NGYyNTg0NzQ3MzNkYjc0ZjM5YmE",
		} }).catch((err) => {
			console.error(err);
			awaitReply.delete(tagName);
		});

		const new_token = response3.data.access_token;

		await axios.put(`https://account-public-service-prod03.ol.epicgames.com/account/api/public/account/${works.account_id}`, {
			"displayName": ctx.message.text,
		}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${new_token}`,
		} }).then((response) => {
			ctx.reply(`✅ Successfully changed display name\n\nOld Display Name: ${works.displayName}\nNew Display Name: ${response.data.accountInfo.displayName}\nNumber of Display Name changes: ${response.data.accountInfo.numberOfDisplayNameChanges}\nCan update Display Name next: ${moment.utc(response.data.accountInfo.canUpdateDisplayNameNext).format("dddd, MMMM Do YYYY, HH:mm")}`);
			awaitReply.delete(tagName);
		}).catch((err) => {
			console.error(err);
			awaitReply.delete(tagName);
			return ctx.reply(`❌ *${err.response.data.errorMessage}*`, { parse_mode: "markdown" });
		});
	}
	else if (what == "homebase") {
		const works = await sessions.get(tagName);
		if (!works) {
			awaitReply.delete(tagName);
			return ctx.reply("❌ You are not logged in!");
		}

		await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${works.account_id}/client/SetHomebaseName?profileId=common_public&rvn=-1`, {
			"homebaseName": ctx.message.text,
		}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${works.access_token}`,
		} }).then((response) => {
			console.log(response.data);

			ctx.reply(`✅ Successfully set homebase name to *${ctx.message.text}*`, { parse_mode: "markdown" });
			awaitReply.delete(tagName);
		}).catch((err) => {
			console.error(err);
			awaitReply.delete(tagName);
			return ctx.reply(`❌ You do not own STW or you cannot set your Homebase Name to this name. *${err.response.data.errorMessage}*`, { parse_mode: "markdown" });
		});
	}
});

app.launch();
