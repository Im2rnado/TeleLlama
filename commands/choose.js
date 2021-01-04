/* eslint-disable no-inline-comments */

// Modules
const { Markup } = require("telegraf");

// Database
const deviceauth = require("../models/deviceauth.js"),
	deviceauth1 = require("../models/deviceauth1.js"),
	deviceauth2 = require("../models/deviceauth2.js"),
	deviceauth3 = require("../models/deviceauth3.js"),
	deviceauth4 = require("../models/deviceauth4.js"),
	deviceauth5 = require("../models/deviceauth5.js");

module.exports = {
	name: "choose",
	async execute(ctx) {

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
		const exists2 = await deviceauth2.findOne({
			authorID: tagName,
		});
		const exists3 = await deviceauth3.findOne({
			authorID: tagName,
		});
		const exists4 = await deviceauth4.findOne({
			authorID: tagName,
		});
		const exists5 = await deviceauth5.findOne({
			authorID: tagName,
		});

		const accounts = [];

		if (exists) accounts.push(Markup.callbackButton(exists.displayname, "acc1"));
		if (exists2) accounts.push(Markup.callbackButton(exists2.displayname, "acc2"));
		if (exists3) accounts.push(Markup.callbackButton(exists3.displayname, "acc3"));
		if (exists4) accounts.push(Markup.callbackButton(exists4.displayname, "acc4"));
		if (exists5) accounts.push(Markup.callbackButton(exists5.displayname, "acc5"));

		// Send the link
		ctx.reply(`${accounts.length ? "Please choose an account from below" : "You do not have any saved accounts"}`,
			Markup.inlineKeyboard(accounts).extra(),
		);
	},
};