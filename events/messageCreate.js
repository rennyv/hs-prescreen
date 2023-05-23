const config = require('../config.json');
const { Events } = require('discord.js');
const { rejectMessage } = require('../utils/hootsuite');
const { hasMesssage, removeMessage, getMessage } = require('../utils/discord');


module.exports = {
	name: Events.MessageCreate,
	once: false,
	execute(message) {
		if (message.reference) {
			console.log('message:', message);
			message.fetchReference().then((m) => {
				const orgId = process.env.ORG_ID;
				if (hasMesssage(orgId, m.id)) {
					rejectMessage(getMessage(orgId, m.id), message.content);
					removeMessage(orgId, m.id);
					m.react(config.EMOJI.reject);
				}
			});
		}
	},
};
