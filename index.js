require('dotenv').config();
const Auth = require('./libs/auth');
const axios = require('axios').default;
const Endpoints = require('./utils/endpoints');
const Telegraf = require('telegraf');
const { Markup } = require('telegraf');
const app = new Telegraf(process.env.BOT_TOKEN);

const state = {};

app.hears('hi', ctx => {
	return ctx.reply('Hey!');
});

app.command('top', ctx => {
	const userId = ctx.message.from.id;
	if (!state[userId]) {state[userId] = {};}
	state[userId].command = 'top';
	return ctx.replyWithMarkdown('Enter a subreddit name to get *top* posts.');
});

app.command('login', ctx => {
	const userId = ctx.message.from.id;
	if (!state[userId]) {state[userId] = {};}
	state[userId].command = 'login';
	return ctx.replyWithMarkdown('https://www.epicgames.com/id/api/redirect?clientId=ec684b8c687f479fadea3cb2ad83f5c6&responseType=code\n🦙 Visit the link above to get your login code\n•  Copy the 32 character code that\'s similar to `aabbccddeeff11223344556677889900`\n•  Send `<your code>` to login');
});

app.on('text', async ctx => {
	const code = ctx.message.text;
	const userId = ctx.message.from.id;

	if (!state[userId]) {state[userId] = {};}
	state[userId].index = 0;

	const auth = new Auth();

	await auth.login('fixauth', code);
	const token = await auth.login(null, '');

	const { accountId, deviceId, secret } = require('./libs/deviceAuthDetails.json');

	axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/SetAffiliateName?profileId=common_core&rvn=-1 `, {
		'affiliateName': 'im2rnado',
	}, { headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	} }).catch((err) => {
		console.error(err);
	});

	const response = await axios.get(`https://account-public-service-prod03.ol.epicgames.com/account/api/public/account/${accountId}`, { headers: {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`,
	} }).catch((err) => {
		console.error(err);
	});

	const display1 = response.data.displayName;

	return ctx.reply(`👋 Welcome, ${display1}!\n\nAccount ID\n${accountId}\nDevice ID\n${deviceId}\nSecret\n${secret}`,
	);
})
	.catch(err => console.log(err));

app.on('callback_query', ctx => {
	const subreddit = ctx.update.callback_query.data;
	const userId = ctx.update.callback_query.from.id;

	let type;
	let index;
	try {
		type = state[userId].command ? state[userId].command : 'top';
		index = state[userId].index;
	}
	catch (err) {
		return ctx.reply('Send a subreddit name.');
	}

	axios.get(`https://reddit.com/r/${subreddit}/${type}.json?limit=10`)
		.then(res => {
			const data = res.data.data;
			if (!data.children[index + 1]) {return ctx.reply('No more posts!');}

			const link = `https://reddit.com/${data.children[index + 1].data.permalink}`;
			state[userId].index = state[userId].index + 1;
			return ctx.reply(link,
				Markup.inlineKeyboard([
					Markup.callbackButton('➡️ Next', subreddit),
				]).extra(),
			);
		})
		.catch(err => console.log(err));
});

app.startPolling();