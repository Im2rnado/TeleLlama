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

		const response = await axios.get(`${Endpoints.DEVICE_AUTH}/${token.account_id}`, { headers: {
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

		const info = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/QueryProfile?profileId=athena`, {}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).catch((err) => {
			console.error(err);
		});

		const cosmetics = (await axios.get("https://fortnite-api.com/v2/cosmetics/br")).data.data;

		const exclusives = ["cid_313_athena_commando_m_kpopfashion", "cid_028_athena_commando_f", "cid_017_athena_commando_m", "pickaxe_id_294_candycane", "cid_113_athena_commando_m_blueace", "cid_183_athena_commando_m_modernmilitaryred", "cid_757_athena_commando_f_wildcat", "cid_174_athena_commando_f_carbidewhite", "cid_516_athena_commando_m_blackwidowrogue", "cid_441_athena_commando_f_cyberscavengerblue", "cid_342_athena_commando_m_streetracermetallic", "cid_479_athena_commando_f_davinci", "cid_434_athena_commando_f_stealthhonor", "cid_175_athena_commando_m_celestial", "cid_138_athena_commando_m_psburnout", "pickaxe_id_189_streetopsstealth", "eid_kpopdance03", "cid_114_athena_commando_f_tacticalwoodland", "glider_id_090_celestial", "glider_warthog", "cid_052_athena_commando_f_psblue", "cid_085_athena_commando_m_twitch", "pickaxe_id_077_carbidewhite", "pickaxe_id_116_celestial", "pickaxe_id_039_tacticalblack", "glider_id_056_carbidewhite", "eid_bollywood", "cid_783_athena_commando_m_aquajacket", "cid_371_athena_commando_m_speedymidnight", "spid_066_llamalaxy", "cid_296_athena_commando_m_math", "pickaxe_lockjaw", "glider_id_001", "cid_657_athena_commando_f_techopsblue", "cid_711_athena_commando_m_longshorts", "eid_playereleven", "pickaxe_id_088_psburnout", "bid_055_psburnout", "wrap_121_techopsblue", "trails_id_019_psburnout", "trails_id_059_sony2", "glider_id_013_psblue", "bid_224_techopsblue", "glider_id_067_psburnout", "pickaxe_id_464_longshortsmale", "pickaxe_id_256_techopsblue", "bid_482_longshorts", "bid_448_techopsbluefemale", "glider_id_217_longshortsmale", "bid_169_mathmale", "trails_id_091_longshorts", "bid_234_speedymidnight", "glider_id_131_speedymidnight", "bid_346_blackwidowrogue", "pickaxe_id_178_speedymidnight", "founderumbrella", "glider_id_137_streetopsstealth", "bid_138_celestial", "bid_521_wildcat", "vtid_389_halloween_stylec", "vtid_052_skull_trooper_redflames", "bid_288_cyberscavengerfemaleblue", "cid_619_athena_commando_f_techllama", "cid_515_athena_commando_m_barbequelarry", "founderglider", "petcarrier_013_bbqlarry", "pickaxe_id_265_barbequelarry1h", "cid_035_athena_commando_m_medieval", "cid_039_athena_commando_f_disco", "pickaxe_id_013_teslacoil", "pickaxe_id_153_roseleader", "pickaxe_id_237_warpaint", "pickaxe_id_stw001_tier_1", "pickaxe_id_stw007_basic", "cid_386_athena_commando_m_streetopsstealth", "bid_249_streetopsstealth", "glider_id_137_streetopsstealth", "pickaxe_id_189_streetopsstealth", "cid_261_athena_commando_m_raptorarcticcamo", "bid_142_raptorarcticcamo", "glider_id_074_raptorarcticcamo", "pickaxe_id_097_raptorarcticcamo"];
		const exclusive = [];
		const skins = [];

		const object = Object.keys(info.data.profileChanges[0].profile.items);

		// Skins
		for (let i = 0; i < object.length; i++) {
			const item00 = info.data.profileChanges[0].profile.items[object[i]];
			if(item00.templateId.includes("AthenaCharacter")) {
				const splitid = item00.templateId.split(":")[1];
				const item = await cosmetics.find(it => it.id.toLowerCase() == splitid);
				skins.push(item);
				const isExlusive = exclusives.find(el => el === item.id.toLowerCase());
				if (isExlusive) {
					item.rarity.value = "exclusive";
					exclusive.push(item);
				}
			}
		}

		let level = info.data.profileChanges[0].profile.stats.attributes.level;
		const xp = info.data.profileChanges[0].profile.stats.attributes.xp;
		const acclevel = info.data.profileChanges[0].profile.stats.attributes.accountLevel;
		const created = info.data.profileChanges[0].profile.created;

		if (!tag) {
			fname = "⋆".repeat(fname.length);
			lastlogin = "⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆";
			dischanges = "⋆".repeat(dischanges.toString().length);
			country = "⋆".repeat(country.length);
			canupdatenext = "⋆⋆⋆⋆⋆⋆⋆";
			tfa = "⋆⋆⋆";
			level = "⋆⋆⋆";
		}

		try {
			ctx.reply(`*${displayname}*'s Info\n\n*Account ID*: ${id}\n*Real Name*: ${fname} ${lname}\n*Email*: ${email}\n*Phone Number*: ${!pnumber ? "No Phone Number" : pnumber}\n*Account Country*: ${country}\n*Last Login*: ${moment.utc(lastlogin).format("dddd, MMMM Do YYYY, HH:mm")}\n*Display Name Changes*: ${dischanges}\n*Can update Display Name*? ${!canupdaten == true ? `${canupdaten}, ${moment.utc(canupdatenext).format("dddd, MMMM Do YYYY, HH:mm:ss")}` : canupdaten }\n*Email Verified*? ${ever}\n*2FA On*? ${tfa}\n*Creation Date*: ${created}\n*Battle Pass Level*: ${level} (${xp})\n*Account Level*: ${acclevel}\n*Exclusives and OGs*: ${exclusive.length ? exclusive.join(", ") : "None"}`, { parse_mode: "markdown" });
		}
		catch {
			ctx.reply(`${displayname}'s Info\n\nAccount ID: ${id}\nReal Name: ${fname} ${lname}\nEmail: ${email}\nPhone Number: ${!pnumber ? "No Phone Number" : pnumber}\nAccount Country: ${country}\nLast Login: ${moment.utc(lastlogin).format("dddd, MMMM Do YYYY, HH:mm")}\nDisplay Name Changes: ${dischanges}\nCan update Display Name? ${!canupdaten == true ? `${canupdaten}, ${moment.utc(canupdatenext).format("dddd, MMMM Do YYYY, HH:mm:ss")}` : canupdaten }\nEmail Verified? ${ever}\n*2FA On*? ${tfa}\nCreation Date: ${created}\nBattle Pass Level: ${level} (${xp})\nAccount Level: ${acclevel}\nExclusives and OGs: ${exclusive.length ? exclusive.join(", ") : "None"}`);
		}
		if (!tag) {
			ctx.reply("❌ To view all the info, purchase an Activation code from any of our admins:\n• @im2rnado - BTC\n• @sxlar_sells - CashApp\n• @dingus69 - PayTM \n• @ehdan69 CashApp, PayPal, PayTM!");
		}
	},
};