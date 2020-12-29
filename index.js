/* eslint-disable no-inline-comments */

// Resources
require("dotenv").config();
const Auth = require("./libs/auth");
const Endpoints = require("./utils/endpoints");

// Modules
const axios = require("axios").default;
const mongoose = require("mongoose");
const moment = require("moment");
const fs = require("fs");
const Telegraf = require("telegraf");
const { Markup } = require("telegraf");
const app = new Telegraf(process.env.BOT_TOKEN);

// Database
const premUsers = require("./models/premium.js"),
	deviceauth = require("./models/deviceauth.js"),
	deviceauth1 = require("./models/deviceauth1.js"),
	deviceauth2 = require("./models/deviceauth2.js"),
	deviceauth3 = require("./models/deviceauth3.js"),
	deviceauth4 = require("./models/deviceauth4.js"),
	deviceauth5 = require("./models/deviceauth5.js");

fs.readdirSync(`${__dirname}/commands/`).forEach(file => {
	const command = require(`${__dirname}/commands/${file}`);

	if (command.name) {
		app.command(command.name, ctx => {
			command.execute(ctx);
		});
	}
});

app.hears("hi", async (ctx) => {
	const tag = await premUsers.findOne({
		ID: ctx.from.id,
	});
	if (!tag) {
		return ctx.reply("❌ Purchase Premium from @im2rnado first!");
	}
	console.log(ctx.from);
	ctx.reply("Hey!");
});

app.action("ACCINFO", async ctx => {
	const tagName = ctx.from.id;

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
	const fname = response.data.name;
	const email = response.data.email;
	const lastlogin = response.data.lastLogin;
	const dischanges = response.data.numberOfDisplayNameChanges;
	const country = response.data.country;
	const lname = response.data.lastName;
	const pnumber = response.data.phoneNumber;
	const canupdaten = response.data.canUpdateDisplayName;
	const canupdatenext = response.data.canUpdateDisplayNameNext;
	const tfa = response.data.tfaEnabled;
	const ever = response.data.emailVerified;

	return ctx.reply(`*${displayname}*'s Info\n\n*Account ID*: ${id}\n*Real Name*: ${fname} ${lname}\n*Email*: ${email}\n*Phone Number*: ${!pnumber ? "No Phone Number" : pnumber}\n*Account Country*: ${country}\n*Last Login*: ${moment.utc(lastlogin).format("dddd, MMMM Do YYYY, HH:mm")}\n*Display Name Changes*: ${dischanges}\n*Can update Display Name*? ${!canupdaten == true ? `${canupdaten}, ${moment.utc(canupdatenext).format("dddd, MMMM Do YYYY, HH:mm:ss")}` : canupdaten }\n*Email Verified*? ${ever}\n*2FA On*? ${tfa}`, { parse_mode: "markdown" });
});

app.action("acc1", async ctx => {
	const tagName = ctx.from.id;

	// Fetches current logged in account
	const exist = await deviceauth.findOne({
		authorID: tagName,
	});

	if (exist) {
		await deviceauth.findOneAndDelete({
			authorID: tagName,
		});
	}

	// Gets saved accounts
	const exists = await deviceauth1.findOne({
		authorID: tagName,
	});

	const newData2 = new deviceauth({
		authorID: tagName,
		accountId: exists.accountId,
		deviceId: exists.deviceId,
		secret: exists.secret,
	});
	await newData2.save();

	const auth = new Auth();

	const token = await auth.login(null, tagName);
	console.log(token.access_token);

	ctx.reply(`👋 Welcome, ${token.displayName}!\n\nAccount ID\n${token.account_id}`,
		Markup.inlineKeyboard([
			Markup.callbackButton("➡️ Get Account Info", "ACCINFO"),
		]).extra(),
	);

	if(token.displayName !== exists.displayName) {
		await deviceauth1.findOneAndDelete({
			authorID: tagName,
		});

		const newData = new deviceauth1({
			authorID: tagName,
			accountId: exists.accountId,
			deviceId: exists.deviceId,
			secret: exists.secret,
			displayname: token.displayName,
		});
		await newData.save();
	}
});

app.action("acc2", async ctx => {
	const tagName = ctx.from.id;

	// Fetches current logged in account
	const exist = await deviceauth.findOne({
		authorID: tagName,
	});

	if (exist) {
		await deviceauth.findOneAndDelete({
			authorID: tagName,
		});
	}

	// Gets saved accounts
	const exists = await deviceauth2.findOne({
		authorID: tagName,
	});

	const newData2 = new deviceauth({
		authorID: tagName,
		accountId: exists.accountId,
		deviceId: exists.deviceId,
		secret: exists.secret,
	});
	await newData2.save();

	const auth = new Auth();

	const token = await auth.login(null, tagName);
	console.log(token.access_token);

	ctx.reply(`👋 Welcome, ${token.displayName}!\n\nAccount ID\n${token.account_id}`,
		Markup.inlineKeyboard([
			Markup.callbackButton("➡️ Get Account Info", "ACCINFO"),
		]).extra(),
	);

	if(token.displayName !== exists.displayName) {
		await deviceauth2.findOneAndDelete({
			authorID: tagName,
		});

		const newData = new deviceauth2({
			authorID: tagName,
			accountId: exists.accountId,
			deviceId: exists.deviceId,
			secret: exists.secret,
			displayname: token.displayName,
		});
		await newData.save();
	}
});

app.action("acc3", async ctx => {
	const tagName = ctx.from.id;

	// Fetches current logged in account
	const exist = await deviceauth.findOne({
		authorID: tagName,
	});

	if (exist) {
		await deviceauth.findOneAndDelete({
			authorID: tagName,
		});
	}

	// Gets saved accounts
	const exists = await deviceauth3.findOne({
		authorID: tagName,
	});

	const newData2 = new deviceauth({
		authorID: tagName,
		accountId: exists.accountId,
		deviceId: exists.deviceId,
		secret: exists.secret,
	});
	await newData2.save();

	const auth = new Auth();

	const token = await auth.login(null, tagName);
	console.log(token.access_token);

	ctx.reply(`👋 Welcome, ${token.displayName}!\n\nAccount ID\n${token.account_id}`,
		Markup.inlineKeyboard([
			Markup.callbackButton("➡️ Get Account Info", "ACCINFO"),
		]).extra(),
	);

	if(token.displayName !== exists.displayName) {
		await deviceauth3.findOneAndDelete({
			authorID: tagName,
		});

		const newData = new deviceauth3({
			authorID: tagName,
			accountId: exists.accountId,
			deviceId: exists.deviceId,
			secret: exists.secret,
			displayname: token.displayName,
		});
		await newData.save();
	}
});

app.action("acc4", async ctx => {
	const tagName = ctx.from.id;

	// Fetches current logged in account
	const exist = await deviceauth.findOne({
		authorID: tagName,
	});

	if (exist) {
		await deviceauth.findOneAndDelete({
			authorID: tagName,
		});
	}

	// Gets saved accounts
	const exists = await deviceauth4.findOne({
		authorID: tagName,
	});

	const newData2 = new deviceauth({
		authorID: tagName,
		accountId: exists.accountId,
		deviceId: exists.deviceId,
		secret: exists.secret,
	});
	await newData2.save();

	const auth = new Auth();

	const token = await auth.login(null, tagName);
	console.log(token.access_token);

	ctx.reply(`👋 Welcome, ${token.displayName}!\n\nAccount ID\n${token.account_id}`,
		Markup.inlineKeyboard([
			Markup.callbackButton("➡️ Get Account Info", "ACCINFO"),
		]).extra(),
	);

	if(token.displayName !== exists.displayName) {
		await deviceauth4.findOneAndDelete({
			authorID: tagName,
		});

		const newData = new deviceauth4({
			authorID: tagName,
			accountId: exists.accountId,
			deviceId: exists.deviceId,
			secret: exists.secret,
			displayname: token.displayName,
		});
		await newData.save();
	}
});

app.action("acc5", async ctx => {
	const tagName = ctx.from.id;

	// Fetches current logged in account
	const exist = await deviceauth.findOne({
		authorID: tagName,
	});

	if (exist) {
		await deviceauth.findOneAndDelete({
			authorID: tagName,
		});
	}

	// Gets saved accounts
	const exists = await deviceauth5.findOne({
		authorID: tagName,
	});

	const newData2 = new deviceauth({
		authorID: tagName,
		accountId: exists.accountId,
		deviceId: exists.deviceId,
		secret: exists.secret,
	});
	await newData2.save();

	const auth = new Auth();

	const token = await auth.login(null, tagName);
	console.log(token.access_token);

	ctx.reply(`👋 Welcome, ${token.displayName}!\n\nAccount ID\n${token.account_id}`,
		Markup.inlineKeyboard([
			Markup.callbackButton("➡️ Get Account Info", "ACCINFO"),
		]).extra(),
	);

	if(token.displayName !== exists.displayName) {
		await deviceauth5.findOneAndDelete({
			authorID: tagName,
		});

		const newData = new deviceauth5({
			authorID: tagName,
			accountId: exists.accountId,
			deviceId: exists.deviceId,
			secret: exists.secret,
			displayname: token.displayName,
		});
		await newData.save();
	}
});

app.telegram.getMe().then((bot_informations) => {
	mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
		console.log("Connected to the MongoDB Database.");
	}).catch((err) => {
		console.log("Unable to connect to the MongoDB Database. Error:" + err);
	});
	app.options.username = bot_informations.username;
	console.log("Server has initialized bot nickname. Nick: " + bot_informations.username);
});

app.launch();