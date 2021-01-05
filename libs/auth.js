"use-strict";
const axios = require("axios").default;
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tokens = require("../utils/tokens");
const Endpoints = require("../utils/endpoints");
const { stringify } = require("querystring");
const deviceauth = require("../models/deviceauth");
axiosCookieJarSupport(axios);

class Auth {
	constructor() {
		this.exchangeCode = "";
	}
	async getDeviceAuth(exchange, tagName) {
		let deviceAuthDetails;
		let deviceAuthFileBuffer = "";
		try {
			deviceAuthFileBuffer = await deviceauth.findOne({
				authorID: tagName,
			});
		}
		catch (err) {
			console.log(err);
		}
		if (deviceAuthFileBuffer) {
			deviceAuthDetails = deviceAuthFileBuffer;
		}
		else {
			return;
		}
		const authData = {
			grant_type: "device_auth",
			account_id: deviceAuthDetails.accountId,
			device_id: deviceAuthDetails.deviceId,
			secret: deviceAuthDetails.secret,
		};
		const fortniteToken = await axios
			.post(Endpoints.OAUTH_TOKEN, stringify(authData), {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `basic ${tokens.launcherToken}`,
				},
				responseType: "json",
			})
			.then((res) => {
				return res.data;
			});
		// console.log(`Your fortnite token is ${fortniteToken.access_token}`);
		return fortniteToken;
	}

	async login(authType, tagName, userAgent, exchangeCode) {
		if (authType === "fixauth") {
			const token = await this.getDeviceAuth(exchangeCode);
			return token;
		}
		else {
			const token = await this.getDeviceAuth("", tagName, userAgent);
			return token;
		}
	}
}
module.exports = Auth;