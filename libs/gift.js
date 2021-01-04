const axios = require("axios").default;
const Endpoints = require("../utils/endpoints");

module.exports = {
	async giftItem(token, item, accId) {

		console.log(item.offer);

		const buy = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/GiftCatalogEntry?profileId=common_core`, {
			"offerId": item.offer,
			"purchaseQuantity": 1,
			"currency": "MtxCurrency",
			"currencySubType": "",
			"expectedTotalPrice": item.price,
			"gameContext": "",
			"receiverAccountIds": [
				accId.id,
			],
			"giftWrapTemplateId": "GiftBox:gb_default",
			"personalMessage": "Gifted Using: t.me/CarbideFNBot",
		}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).then((response) => {
			console.log(response.data);
			console.log(response.data.status);
		}).catch((err) => {
			return err.response;
		});

		if (buy.status == 400) throw buy.data.errorMessage;

		const vbonks = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${token.account_id}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token.access_token}`,
		} }).catch((err) => {
			console.error(err);
		});
		const mtxQantitys = { currency: 0 };
		const keys = Object.keys(vbonks.data.profileChanges[0].profile.items);

		for (let l = 0; l < keys.length; l++) {
			const itemss = vbonks.data.profileChanges[0].profile.items[keys[l]];
			if(itemss.templateId.includes("Currency")) {
				mtxQantitys.fullCurrency = mtxQantitys.currency += itemss.quantity;
			}
		}
		return {
			vbucks: mtxQantitys.fullCurrency || 0,
		};
	},
};