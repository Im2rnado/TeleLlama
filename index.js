/* eslint-disable no-inline-comments */

// Resources
require("dotenv").config();
const Collection = require("@discordjs/collection");
const Endpoints = require("./utils/endpoints");

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
		app.command(command.name, ctx => {
			command.execute(ctx, sessions, awaitReply);
		});
	}
});

fs.readdirSync(`${__dirname}/actions/`).forEach(file => {
	const action = require(`${__dirname}/actions/${file}`);

	if (action.name) {
		app.action(action.name, ctx => {
			action.execute(ctx, sessions, awaitReply);
		});
	}
});

app.telegram.getMe().then(async (bot_informations) => {
	await mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
		console.log("Connected to the MongoDB Database.");
	}).catch((err) => {
		console.log("Unable to connect to the MongoDB Database. Error:" + err);
	});
	app.options.username = bot_informations.username;
	console.log("Server has initialized bot nickname. Nick: " + bot_informations.username);
});

app.hears("hi", async (ctx) => {
	console.log(ctx.message.text.toUpperCase());
	const tag = await premUsers.findOne({
		ID: ctx.from.id,
	});
	if (!tag) {
		return ctx.reply("❌ Purchase Premium from @im2rnado first!");
	}
	console.log(ctx.from);
	ctx.reply("Hey!");
});

app.on("text", async (ctx) => {
	console.log("Received msg");
	const tagName = ctx.from.id;

	const what = awaitReply.get(tagName);

	if (what == "activate") {
		console.log(ctx.message.text);
		const works = await codes.findOne({
			ID: ctx.message.text,
		});
		if (!works) {
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
		console.log(ctx.message.text);
		const works = await sessions.get(tagName);
		if (!works) {
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
			sessions.set(`${tagName}-buy`, item);
			ctx.reply("Are you sure you would like to purchase this item?",
				Markup.inlineKeyboard([Markup.callbackButton("Yes, continue", "purchase")]).extra(),
			);
		}
		else {
			return ctx.reply(`❌ *Item Not Found!*\n\nIt looks like there isn't any item with the name *${ctx.message.text}*\nUse /shop to get today's Item Shop.`, { parse_mode: "markdown" });
		}
	}
	else if (what == "platform") {
		console.log(ctx.message.text);
		const works = await sessions.get(tagName);
		if (!works) {
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
		console.log(ctx.message.text);
		const works = await sessions.get(tagName);
		if (!works) {
			return ctx.reply("❌ You are not logged in!");
		}

		const response3 = await axios.post(Endpoints.OAUTH_TOKEN, stringify({ "grant_type": "token_to_token", "access_token": works.access_token }), { headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": "Basic ZWZlM2NiYjkzODgwNGM3NGIyMGUxMDlkMGVmYzE1NDg6NmUzMWJkYmFlNmE0NGYyNTg0NzQ3MzNkYjc0ZjM5YmE",
		} }).catch((err) => {
			console.error(err);
		});

		const new_token = response3.data.access_token;

		await axios.put(`https://account-public-service-prod03.ol.epicgames.com/account/api/public/account/${works.account_id}`, {
			"displayName": ctx.message.text,
		}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${new_token}`,
		} }).then((response) => {
			ctx.reply(`✅ Successfully changed display name\n\n*Old Display Name*: ${works.displayName}\n*New Display Name*: ${response.data.accountInfo.displayName}\n*Number of Display Name changes*: ${response.data.accountInfo.numberOfDisplayNameChanges}\n*Can update Display Name next*: ${moment.utc(response.data.accountInfo.canUpdateDisplayNameNext).format("dddd, MMMM Do YYYY, HH:mm")}`, { parse_mode: "markdown" });
			awaitReply.delete(tagName);
		}).catch((err) => {
			console.error(err);
			awaitReply.delete(tagName);
			return ctx.reply(`❌ *${err.response.data.errorMessage}*`, { parse_mode: "markdown" });
		});
	}
});

app.launch();