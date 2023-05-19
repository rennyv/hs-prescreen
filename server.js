const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const { Client, GatewayIntentBits, Events } = require('discord.js');
const config = require('./config.json');
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
] });
console.log('Logging in Wol');
client.login(config.BOT_TOKEN);

const app = express();
const port = 3000;

const validMessages = {};
const approvedEmoji = '✅';
const rejectEmoji = '❌';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Hello from prescreener');
});

// We'll call it 'reaction' for short, but it is actually a 'MessageReaction' object
client.on(Events.MessageReactionAdd, (reaction, user) => {
	if (!user) { console.log('Empty user'); }
	const message = reaction.message, emoji = reaction.emoji;
	if (message.id in validMessages) {
		switch (emoji.name) {
		case approvedEmoji:
			approveMessage(validMessages[message.id]);
			delete validMessages[message.id];
			break;
		case rejectEmoji:
			rejectMessage(validMessages[message.id], '');
			delete validMessages[message.id];
			break;
		default:
			console.log(emoji);
		}
	}
});

client.on(Events.MessageCreate, (message) => {
	if (message.reference) {
		message.fetchReference().then((m) => {
			if (m.id in validMessages) {
				rejectMessage(validMessages[m.id], message.content);
				delete validMessages[m.id];
				m.react(rejectEmoji);
			}
		});
	}
});

let currentToken = null;

request.post(config.BASE_URL + '/oauth2/token', {
	auth: { 'user': config.CLIENT_ID, 'pass': config.CLIENT_SECRET, 'sendImmediately': true },
	form: { grant_type:'organization_app', organization_id: '1963819' },
}, function(error, response, body) {
	if (error) {console.error('error:', error);}
	if (response && response.statusCode === 200) {
		const b = JSON.parse(body);
		currentToken = b.access_token;
		console.log('access_token: ', currentToken);
	}
});

function rejectMessage(messageInfo, reason) {
	console.log(`Rejected: ${reason}`, messageInfo);
	const body = { 'sequenceNumber': messageInfo.sequenceNumber };
	if (reason) {
		body['reason'] = reason;
	}
	request.post(config.BASE_URL + '/v1/messages/' + messageInfo.message.id + '/reject',
		{
			'auth': {
				'bearer': currentToken,
			},
			'body': JSON.stringify(body),
		}, function(error, resp, rBody) {
			if (error) {
				console.error('error:', error);
				console.log('resp: ', resp);
				console.log('body: ', rBody);
			}
			console.log('Rejected!', messageInfo);
		});
}

function approveMessage(messageInfo) {
	console.log(messageInfo.message);
	request.post(config.BASE_URL + '/v1/messages/' + messageInfo.message.id + '/approve',
		{
			'auth': {
				'bearer': currentToken,
			},
			'body': JSON.stringify({ 'sequenceNumber': messageInfo.sequenceNumber }),
		}, function(error, resp, rBody) {
			if (error) {
				console.error('error:', error);
				console.log('resp: ', resp);
				console.log('body: ', rBody);
			}
			console.log('Approved!', messageInfo);
		});
}

app.post('/webhooks/messageHandler', (req, res) => {
	const body = req.body;
	console.log(body);
	const channel = client.channels.cache.get(config.DISCORD_CHANNEL);
	if (body.constructor === Array) {
		for (const e of body) {
			const type = e.type;
			const data = e.data;
			switch (type) {
			case 'com.hootsuite.ping.event.v1':
				channel.send('Ping? Pong!');
				break;
			case 'com.hootsuite.messages.event.v1':
				request(config.BASE_URL + '/v1/messages/' + data.message.id,
					{
						'auth': {
							'bearer': currentToken,
						},
					}, function(error, resp, rbody) {
						if (error) {console.error('error:', error);}
						const b = JSON.parse(rbody).data[0];
						channel.send(`${data.state} - ${b.sequenceNumber} - ${b.text}`).then((result) => {
							console.log(data.message);
							e.data['sequenceNumber'] = b.sequenceNumber;
							validMessages[result.id] = e.data;
							console.log('validMessages: ', validMessages);
						});
					});
				break;
			default:
				console.log(`Unknown type: ${e.type}`);
			}
		}
	}
	res.send();
});

app.listen(port, () => console.log(`Prescreen app listening on port ${port}`));

