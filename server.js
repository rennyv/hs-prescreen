const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config.json');
const { Client, GatewayIntentBits } = require('discord.js');
const { getToken } = require('./utils/hootsuite');
const { addMessage } = require('./utils/discord');

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

// Login to Discord
client.login(config.BOT_TOKEN);

// set-up express
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Hello from prescreener');
});

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
				console.log(e.data);
				request(config.BASE_URL + '/v1/messages/' + data.message.id,
					{
						'auth': {
							'bearer': getToken(e.data.organization.id),
						},
					}, function(error, resp, rbody) {
						if (error) {console.error('error:', error);}
						const b = JSON.parse(rbody).data[0];
						channel.send(`${data.state} - ${b.sequenceNumber} - ${b.text}`).then((result) => {
							console.log(data.message);
							e.data['sequenceNumber'] = b.sequenceNumber;
							addMessage(e.data.organization.id, result.id, e.data);
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

