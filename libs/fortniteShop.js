const cron = require("cron-scheduler"),
	axios = require("axios"),
	fs = require("fs"),
	{ genratateShop } = require("./shop");

async function init() {

	cron({ on: " 1 16 * * * " }, async function() {
		console.log("autoshop");
		let path = "./src/final/path.txt";

		if (fs.existsSync("./src/final/shop.png")) path = "./src/final/shop.png";

		fs.unlinkSync(path);

		const shop = await axios.get("https://api.carbidebot.com/shop/br/combined").catch((err) => {
			console.log(`${err}`.red);
		});

		await genratateShop(shop.data.br);
	});
}

module.exports = { init };