/* eslint-disable no-async-promise-executor */
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");

module.exports = {
	async createLocker(content, tagName) {

		registerFont("./assets/fonts/BurbankBigRegularBlack.otf", { family: "Burbank Big Regular", style: "Black" });

		const imageY = Math.ceil(content.length / 11);

		if(content.length < 150) {

			const canvas = createCanvas(260 * 11, 260 * imageY, "png");
			const ctx = canvas.getContext("2d");

			return new Promise(async (resolve) => {
				let featuredX = 0;
				let featuredY = 0;
				let rendered = 0;

				const background = await loadImage("./assets/background.png");
				ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				for(const itemStack in content) {
					const item = content[itemStack];
					// let cid;
					// if(!item.images.featured) { cid = item.images.icon; }
					// else { cid = `https://media.fortniteapi.io/images/render/displayAssets/v2/DAv2_${item.id}/MI_${item.id}.png`; }
					let itemImg;
					let box;
					let ov;

					/**
				 * - Load Images
				**/
					try {
						box = await loadImage(`./assets/box/${item.rarity.value}BG.png`);
						ov = await loadImage(`./assets/box/${item.rarity.value}OV.png`);
					}
					catch {
						box = await loadImage("./assets/box/commonBG.png");
						ov = await loadImage("./assets/box/commonOV.png");
					}
					try {
						itemImg = await loadImage(item.images.icon);
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
					try {
						cosName = item.name;
					}
					catch {
						cosName = "Not Found";
					}
					let measure = ctx.measureText(cosName).width;
					while (measure > 190) {
						fontSize = fontSize - 1;
						ctx.font = "italic " + fontSize + "px Burbank Big Rg Bk";
						measure = ctx.measureText(cosName).width;
					}
					const left = featuredX + (130 - (measure / 2));
					ctx.fillText(cosName, left, featuredY + 227);

					featuredX = featuredX + 260;
					rendered = rendered + 1;
					if(rendered === 11) {
						rendered = 0;
						featuredY = featuredY + 260;
						featuredX = 0;
					}

				}
				// Watermark
				ctx.fillStyle = "#ffffff";
				ctx.font = "italic 65px Burbank Big Rg Bk";
				ctx.textBaseline = "middle";
				ctx.textAlign = "center";
				ctx.fillText("t.me/CarbideFNBot", canvas.width / 2, canvas.height / 2);

				const end = fs.createWriteStream(`./final/${tagName}-locker.png`);
				const stream = canvas.createPNGStream().pipe(end);
				stream.on("finish", () => {
					resolve(`./final/${tagName}-locker.png`);
				});

			}).catch((err) => {
				console.error(err);
			});
		}
		else {
			const canvas = createCanvas(260 * 11, 260 * imageY);
			const ctx = canvas.getContext("2d");

			return new Promise(async (resolve) => {
				let featuredX = 0;
				let featuredY = 0;
				let rendered = 0;

				ctx.fillStyle = "#36393F";
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				for(const itemStack in content) {
					const item = content[itemStack];
					// let cid;
					// if(!item.images.featured) { cid = item.images.icon; }
					// else { cid = `https://media.fortniteapi.io/images/render/displayAssets/v2/DAv2_${item.id}/MI_${item.id}.png`; }
					let itemImg;
					let box;
					let ov;

					/**
				 * - Load Images
				**/
					try {
						box = await loadImage(`./assets/box/${item.rarity.value}BG.png`);
						ov = await loadImage(`./assets/box/${item.rarity.value}OV.png`);
					}
					catch {
						box = await loadImage("./assets/box/commonBG.png");
						ov = await loadImage("./assets/box/commonOV.png");
					}
					try {
						itemImg = await loadImage(item.images.icon);
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
					try {
						cosName = item.name;
					}
					catch {
						cosName = "Not Found";
					}
					let measure = ctx.measureText(cosName).width;
					while (measure > 190) {
						fontSize = fontSize - 1;
						ctx.font = "italic " + fontSize + "px Burbank Big Rg Bk";
						measure = ctx.measureText(cosName).width;
					}
					const left = featuredX + (130 - (measure / 2));
					ctx.fillText(cosName, left, featuredY + 227);

					featuredX = featuredX + 260;
					rendered = rendered + 1;
					if(rendered === 11) {
						rendered = 0;
						featuredY = featuredY + 260;
						featuredX = 0;
					}

				}
				// Watermark
				ctx.fillStyle = "#ffffff";
				ctx.font = "italic 65px Burbank Big Rg Bk";
				ctx.textBaseline = "middle";
				ctx.textAlign = "center";
				ctx.fillText("t.me/CarbideFNBot", canvas.width / 2, canvas.height / 2);

				const end = fs.createWriteStream(`./final/${tagName}-locker.jpeg`);
				const stream = canvas.createStream().pipe(end);
				stream.on("finish", () => {
					resolve(`./final/${tagName}-locker.jpeg`);
				});

			}).catch((err) => {
				console.error(err);
			});
		}
	},
};
