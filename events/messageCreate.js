const config = require('../config.json');
const { Events } = require('discord.js');
const { rejectMessage } = require('../utils/hootsuite');
const { hasMesssage, removeMessage } = require('../utils/discord');


module.exports = {
	name: Events.MessageReactionAdd,
	once: false,
	execute(message) {
		if (message.reference) {
			message.fetchReference().then((m) => {
				if (hasMesssage(111, m.id)) {
					rejectMessage(m.id, message.content);
					removeMessage(111, m.id);
					m.react(config.EMOJI.reject);
				}
			});
		}
	},
};
