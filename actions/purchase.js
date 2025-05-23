const { buyItem } = require("../libs/buy");

module.exports = {
	name: "purchase",
	async execute(ctx, sessions, awaitReply) {

		const tagName = ctx.from.id;

		try {

			// Fetches current logged in account
			const works = await sessions.get(tagName);
			if (!works) {
				return ctx.reply("❌ You are not logged in!");
			}

			const item = await sessions.get(`${tagName}-buy`);

			let h;
			try {
				h = await buyItem(works, item);
			}
			catch (e) {
				awaitReply.delete(tagName);
				sessions.delete(`${tagName}-buy`);
				return ctx.reply(`❌ ${e}`);
			}
			ctx.reply(`✅ Successfully Purchased *${item.name}*\n\n*V-Bucks Remaining*: ${h.vbucks}!`, { parse_mode: "markdown" });
			awaitReply.delete(tagName);
			sessions.delete(`${tagName}-buy`);
		}
		catch(err) {
			console.error(err);
			return ctx.reply(`❌ You encountered an error\n\n${err}`);
		}
	},
};