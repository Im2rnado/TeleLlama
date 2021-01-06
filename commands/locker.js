/* eslint-disable no-inline-comments */
// Resources
const { Sort } = require("../libs/sort");
const { createLocker } = require("../libs/locker");
const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");

// Modules
const axios = require("axios").default;
const fs = require("fs");

// Database
const deviceauth = require("../models/deviceauth.js");

module.exports = {
	name: "locker",
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

			const response = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/QueryProfile?profileId=athena`, {}, { headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token.access_token}`,
			} }).catch((err) => {
				console.error(err);
			});

			const parseds = [];
			const parsede = [];
			const parsedp = [];
			const parsedg = [];
			let path;

			const cosmetics = (await axios.get("https://fortnite-api.com/v2/cosmetics/br")).data.data;

			const object = Object.keys(response.data.profileChanges[0].profile.items);

			// Skins
			for (let i = 0; i < object.length; i++) {
				const item00 = response.data.profileChanges[0].profile.items[object[i]];

				if(item00.templateId.includes("AthenaCharacter")) {
					const splitid = item00.templateId.split(":")[1];
					const cosmetics2 = cosmetics.find(it => it.id.toLowerCase() === splitid);
					const itemn = cosmetics2;
					parseds.push(itemn);
				}
			}

			// Emotes
			for (let i = 0; i < object.length; i++) {
				const item00 = response.data.profileChanges[0].profile.items[object[i]];

				if(item00.templateId.includes("AthenaDance")) {
					const splitid = item00.templateId.split(":")[1];
					if(splitid.includes("eid")) {
						const cosmetics2 = cosmetics.find(it => it.id.toLowerCase() === splitid);
						const itemn = cosmetics2;
						parsede.push(itemn);
					}
				}
			}

			// Pickaxes
			for (let i = 0; i < object.length; i++) {
				const item00 = response.data.profileChanges[0].profile.items[object[i]];

				if(item00.templateId.includes("AthenaPickaxe")) {
					const splitid = item00.templateId.split(":")[1];
					const cosmetics2 = cosmetics.find(it => it.id.toLowerCase() === splitid);
					const itemn = cosmetics2;
					parsedp.push(itemn);
				}
			}

			// Gliders
			for (let i = 0; i < object.length; i++) {
				const item00 = response.data.profileChanges[0].profile.items[object[i]];

				if(item00.templateId.includes("AthenaGlider")) {
					const splitid = item00.templateId.split(":")[1];
					const cosmetics2 = cosmetics.find(it => it.id.toLowerCase() === splitid);
					const itemn = cosmetics2;
					parsedg.push(itemn);
				}
			}

			// If no skins
			if(!parseds.length) return ctx.send("❌ No Skins");

			// Skins
			ctx.reply(`Rendering *${parseds.length}* skins. This may take a while ...`, { parse_mode: "markdown" });
			const parsedss = await Sort(parseds);
			await createLocker(parsedss, ctx.from, "Skins");
			console.log("Created Skins Image");
			if (fs.existsSync(`./final/${tagName}-locker.png`)) path = `./final/${tagName}-locker.png`;
			else path = `./final/${tagName}-locker.jpeg`;
			await ctx.replyWithPhoto({ source: path }, { caption: `${parseds.length} Skins` });
			fs.unlinkSync(path);

			// Emotes
			ctx.reply(`Rendering *${parsede.length}* emotes. This may take a while ...`, { parse_mode: "markdown" });
			const parsedee = await Sort(parsede);
			await createLocker(parsedee, ctx.from, "Emotes");
			console.log("Created Emotes Image");
			if (fs.existsSync(`./final/${tagName}-locker.png`)) path = `./final/${tagName}-locker.png`;
			else path = `./final/${tagName}-locker.jpeg`;
			await ctx.replyWithPhoto({ source: path }, { caption: `${parsede.length} Emotes` });
			fs.unlinkSync(path);

			// Pickaxes
			ctx.reply(`Rendering *${parsedp.length}* pickaxes. This may take a while ...`, { parse_mode: "markdown" });
			const parsedpp = await Sort(parsedp);
			await createLocker(parsedpp, ctx.from, "Pickaxes");
			console.log("Created Pickaxes Image");
			if (fs.existsSync(`./final/${tagName}-locker.png`)) path = `./final/${tagName}-locker.png`;
			else path = `./final/${tagName}-locker.jpeg`;
			await ctx.replyWithPhoto({ source: path }, { caption: `${parsedp.length} Pickaxes` });
			fs.unlinkSync(path);

			// Gliders
			ctx.reply(`Rendering *${parsedg.length}* gliders. This may take a while ...`, { parse_mode: "markdown" });
			const parsedgg = await Sort(parsedg);
			await createLocker(parsedgg, ctx.from, "Gliders");
			console.log("Created Gliders Image");
			if (fs.existsSync(`./final/${tagName}-locker.png`)) path = `./final/${tagName}-locker.png`;
			else path = `./final/${tagName}-locker.jpeg`;
			await ctx.replyWithPhoto({ source: path }, { caption: `${parsedg.length} Gliders` });
			fs.unlinkSync(path);
		}
		catch(err) {
			console.error(err);
			return ctx.reply(`❌ You encountered an error\n\n${err}`);
		}
	},
};