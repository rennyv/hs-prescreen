require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { getToken } = require('./utils/hootsuite');
const { addMessage } = require('./utils/discord');

if (!process.env.BOT_TOKEN) {
	console.log('DISCORD BOT token is missing!');
}
if (!process.env.CLIENT_ID) {
	console.log('HOOTSTUITE CLIENT ID is missing!');
}
if (!process.env.CLIENT_SECRET) {
	console.log('HOOTSTUITE SECRET is missing!');
}

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildMessageReactions,
] });

// Load Discord events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// // Login to Discord
client.login(process.env.BOT_TOKEN);

// // set-up express
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Hello from prescreener');
});

app.post('/webhooks/messageHandler', (req, res) => {
	const body = req.body;
	console.log(body);
	const channel = client.channels.cache.find(c => c.name === process.env.DISCORD_CHANNEL);
	if (body.constructor === Array) {
		for (const e of body) {
			console.log('event:', e);
			const type = e.type;
			const data = e.data;
			switch (type) {
			case 'com.hootsuite.ping.event.v1':
				channel.send('Ping? Pong!');
				break;
			case 'com.hootsuite.messages.event.v1':
				console.log('event data', e.data);
				request(process.env.BASE_URL + '/v1/messages/' + data.message.id,
					{
						'auth': {
							'bearer': getToken(e.data.organization.id),
						},
					}, function(error, resp, rbody) {
						if (error) {console.error('error:', error);}
						const messageObj = JSON.parse(rbody).data[0];
						console.log(messageObj);
						e.data['sequenceNumber'] = messageObj.sequenceNumber;
						switch (data.state) {
						case 'PENDING_APPROVAL':
							console.log('rbody: ', rbody);
							// eslint-disable-next-line no-case-declarations
							const embedMessage = new EmbedBuilder()
								.setColor(0x0099FF)
								.setTitle(`Twitter Pending Approval Scheduled @ ${messageObj.scheduledSendTime}`)
								.setAuthor({ name: messageObj.lastUpdatedByMember.id, iconURL: 'https://toppng.com/uploads/preview/twitter-bird-png-11536001205yu3qae5msc.png' })
								.setDescription(messageObj.text)
								.setTimestamp();
							channel.send({ embeds: [embedMessage] }).then((result) => {
								addMessage(e.data.organization.id, result.id, e.data);
								console.log(data.message);
							});
							break;
						default:
							channel.send(`${data.state} - ${messageObj.sequenceNumber} - ${messageObj.text}`).then((result) => {
								addMessage(e.data.organization.id, result.id, e.data);
								console.log(data.message);
							});
						}
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

