const axios = require("axios");
const moment = require("moment");
const date = moment().utcOffset("+0200").format("dddd, MMMM Do YYYY");
const fs = require("fs");

const { genratateShop } = require("../libs/shop");

module.exports = {
	name: "shop",
	async execute(ctx) {


		fs.stat("./src/final/shop.png", async function(err) {
			if(!err) {
				await ctx.replyWithPhoto({ source: "./src/final/shop.png" }, { caption: `**🛒 Fortnite Item Shop | ${date}**` });
			}
			else {
				const response2 = await axios.get("https://api.carbidebot.com/shop/br/combined", { headers: {
					"Content-Type": "application/json",
				} }).catch((err) => {
					console.error(err);
				});

				await genratateShop(response2.data.br);
				console.log("Generated Shop");

				let path;

				if (fs.existsSync("./src/final/shop.png")) path = "./src/final/shop.png";

				await ctx.replyWithPhoto({ source: path }, { caption: `**🛒 Fortnite Item Shop | ${date}**` });
			}
		});
	},
};