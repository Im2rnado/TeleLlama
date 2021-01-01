const axios = require("axios").default;
const deviceauth = require("../models/deviceauth.js");
const deviceauth1 = require("../models/deviceauth1.js");
const deviceauth2 = require("../models/deviceauth2.js");
const deviceauth3 = require("../models/deviceauth3.js");
const deviceauth4 = require("../models/deviceauth4.js");
const deviceauth5 = require("../models/deviceauth5.js");
const Endpoints = require("../utils/endpoints");
const Auth = require("../libs/auth");

module.exports = {
	name: "receipts",
	async execute(ctx, sessions) {

		const tagName = ctx.from.id;

		const exist = await deviceauth.findOne({
			authorID: tagName,
		});

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

		try {

			if (!exist) {
				return ctx.reply("❌ You are not logged in to a saved acccount");
			}

			const auth = new Auth();

			const token = await auth.login(null, tagName);
			console.log(token.access_token);

			await axios.delete(`${Endpoints.DEVICE_AUTH}/${exist.accountId}/deviceAuth/${exist.deviceId}`, { headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token.access_token}`,
			} }).then(async (response) => {
				console.error(response.data);

				if (exists && exist.deviceId === exists.deviceId) {
					await deviceauth1.findOneAndDelete({
						authorID: tagName,
					});
				}
				else if (exists2 && exist.deviceId === exists2.deviceId) {
					await deviceauth2.findOneAndDelete({
						authorID: tagName,
					});
				}
				else if (exists3 && exist.deviceId === exists3.deviceId) {
					await deviceauth3.findOneAndDelete({
						authorID: tagName,
					});
				}
				else if (exists4 && exist.deviceId === exists4.deviceId) {
					await deviceauth4.findOneAndDelete({
						authorID: tagName,
					});
				}
				else if (exists5 && exist.deviceId === exists5.deviceId) {
					await deviceauth5.findOneAndDelete({
						authorID: tagName,
					});
				}

				await deviceauth.findOneAndDelete({
					authorID: tagName,
				});

				sessions.delete(tagName);

				ctx.reply("✅ Successfully logged out and deleted device auth!");
			}).catch(async (err) => {
				console.error(err);

				if (exists && exist.deviceId === exists.deviceId) {
					await deviceauth1.findOneAndDelete({
						authorID: tagName,
					});
				}
				else if (exists2 && exist.deviceId === exists2.deviceId) {
					await deviceauth2.findOneAndDelete({
						authorID: tagName,
					});
				}
				else if (exists3 && exist.deviceId === exists3.deviceId) {
					await deviceauth3.findOneAndDelete({
						authorID: tagName,
					});
				}
				else if (exists4 && exist.deviceId === exists4.deviceId) {
					await deviceauth4.findOneAndDelete({
						authorID: tagName,
					});
				}
				else if (exists5 && exist.deviceId === exists5.deviceId) {
					await deviceauth5.findOneAndDelete({
						authorID: tagName,
					});
				}

				await deviceauth.findOneAndDelete({
					authorID: tagName,
				});

				sessions.delete(tagName);

				ctx.reply("✅ Successfully logged out and deleted device auth!");
			});
		}
		catch(err) {
			console.error(err);

			if (exists && exist.deviceId === exists.deviceId) {
				await deviceauth1.findOneAndDelete({
					authorID: tagName,
				});
			}
			else if (exists2 && exist.deviceId === exists2.deviceId) {
				await deviceauth2.findOneAndDelete({
					authorID: tagName,
				});
			}
			else if (exists3 && exist.deviceId === exists3.deviceId) {
				await deviceauth3.findOneAndDelete({
					authorID: tagName,
				});
			}
			else if (exists4 && exist.deviceId === exists4.deviceId) {
				await deviceauth4.findOneAndDelete({
					authorID: tagName,
				});
			}
			else if (exists5 && exist.deviceId === exists5.deviceId) {
				await deviceauth5.findOneAndDelete({
					authorID: tagName,
				});
			}

			await deviceauth.findOneAndDelete({
				authorID: tagName,
			});

			sessions.delete(tagName);

			ctx.reply("✅ Successfully logged out and deleted device auth!");
		}
	},
};