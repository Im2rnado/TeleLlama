const fs = require("fs");
const { createCanvas, loadImage, registerFont } = require("canvas");

module.exports = {
	async genratateShop(content) {

		registerFont("./assets/fonts/BurbankBigRegularBlack.otf", { family: "Burbank Big Regular", style: "Black" });

		let renderedlen = 0;

		if (content.length < 10) {
			renderedlen = 4;
		}
		else if (content.length < 20) {
			renderedlen = 5;
		}
		else if (content.length < 30) {
			renderedlen = 6;
		}
		else if (content.length < 40) {
			renderedlen = 7;
		}
		else if (content.length < 50) {
			renderedlen = 8;
		}
		else {
			renderedlen = 9;
		}

		const canvasHeight = Math.ceil(content.length / renderedlen);
		const canvasWidth = Math.ceil(260 * renderedlen);

		const canvas = createCanvas(canvasWidth, 260 * canvasHeight, "png");
		const ctx = canvas.getContext("2d");

		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve) => {

			let featuredX = 0;
			let featuredY = 0;
			let rendered = 0;
			const background = await loadImage("./assets/background.png");
			ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for(const itemStack in content) {
				const item = content[itemStack];
				let itemImg;
				let box;
				let ov;

				/**
				* - Load Images
				**/
				try {
					box = await loadImage(`./assets/box/${item.rarity}BG.png`);
					ov = await loadImage(`./assets/box/${item.rarity}OV.png`);
				}
				catch {
					box = await loadImage("./assets/box/commonBG.png");
					ov = await loadImage("./assets/box/commonOV.png");
				}

				try {
					itemImg = await loadImage(item.image);
				}
				catch {
					itemImg = await loadImage("https://aboalishibani.com/wp-content/uploads/2014/12/default-placeholder.png");
				}

				/**
				* - Draw Image
				**/
				ctx.drawImage(box, featuredX, featuredY, 260, 260);
				ctx.drawImage(itemImg, featuredX + 18, featuredY, 220, 220);
				ctx.drawImage(ov, featuredX, featuredY, 260, 260);

				/**
				* - Load & Draw Name
				**/
				ctx.fillStyle = "#ffffff";
				let fontSize = 29;
				ctx.font = "italic " + fontSize + "px Burbank Big Rg Bk";
				let cosName;
				const number = Number(itemStack) + Number(1);
				try {
					cosName = `${number}. ${item.name.toUpperCase()}`;
				}
				catch {
					cosName = "Not Found";
				}
				let measure = ctx.measureText(cosName).width;
				while (measure > 190) {
					fontSize = fontSize - 0.4;
					ctx.font = "italic " + fontSize + "px Burbank Big Rg Bk";
					measure = ctx.measureText(cosName).width;
				}
				const left = featuredX + (130 - (measure / 2));
				ctx.fillText(cosName, left, featuredY + 227);

				/**
				* - Load & Draw Price
			    **/
				ctx.fillStyle = "#ffffff";
				const fontSize2 = 20;
				ctx.font = "italic " + fontSize2 + "px Burbank Big Rg Bk";
				let cosPrice;
				try {
					cosPrice = item.price.toLocaleString();
				}
				catch {
					cosPrice = "Not Found";
				}
				const measure2 = ctx.measureText(cosPrice).width;
				const left2 = featuredX + (130 - (measure2 / 2));
				ctx.fillText(cosPrice, left2 + 65, featuredY + 255);

				const vbucks = await loadImage("./assets/vbucksnew.png");
				ctx.drawImage(vbucks, featuredX, featuredY, 260, 260);

				/**
		    	* - Rows
				**/
				featuredX = featuredX + 260;
				rendered = rendered + 1;
				if(rendered === renderedlen) {
					rendered = 0;
					featuredY = featuredY + 260;
					featuredX = 0;
				}
			}
			const end = fs.createWriteStream("./final/shop.png");
			const stream = canvas.createPNGStream().pipe(end);
			stream.on("finish", () => {
				resolve("./final/shop.png");
			});
		}).catch((err) => {
			console.error(err);
		});
	},
};