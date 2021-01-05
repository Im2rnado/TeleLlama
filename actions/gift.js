const { giftItem } = require("../libs/gift");

module.exports = {
	name: "gift",
	async execute(ctx, sessions, awaitReply) {

		const tagName = ctx.from.id;

		// Fetches current logged in account
		const works = await sessions.get(tagName);
		if (!works) {
			return ctx.reply("❌ You are not logged in!");
		}

		const item = await sessions.get(`${tagName}-gift`);
		const user = await sessions.get(`${tagName}-giftuser`);

		let h;
		try {
			h = await giftItem(works, item, user);
		}
		catch (e) {
			awaitReply.delete(tagName);
			sessions.delete(`${tagName}-gift`);
			sessions.delete(`${tagName}-giftuser`);
			return ctx.reply(`❌ ${e}`);
		}
		try {
			ctx.reply(`✅ Successfully Gifted *${item.name}* to *${user.displayName}*\n\n*V-Bucks Remaining*: ${h.vbucks}`, { parse_mode: "markdown" });
		}
		catch {
			ctx.reply(`✅ Successfully Gifted ${item.name} to ${user.displayName}\n\nV-Bucks Remaining: ${h.vbucks}`);
		}
		awaitReply.delete(tagName);
		sessions.delete(`${tagName}-gift`);
		sessions.delete(`${tagName}-giftuser`);
	},
};