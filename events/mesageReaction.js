const config = require('../config.json');
const { Events } = require('discord.js');
const { approveMessage, rejectMessage } = require('../utils/hootsuite');
const { getMessage, hasMesssage, removeMessage } = require('../utils/discord');

module.exports = {
	name: Events.MessageReactionAdd,
	once: false,
	execute(reaction, user) {
		if (!user) { console.log('Empty user'); }
		const message = reaction.message, emoji = reaction.emoji;
		if (hasMesssage(111, message.id)) {
			switch (emoji.name) {
			case config.EMOJI.approved:
				approveMessage(getMessage(111, message.id));
				removeMessage(111, message.id);
				break;
			case config.EMOJI.reject:
				rejectMessage(getMessage(111, message.id));
				removeMessage(111, message.id);
				break;
			default:
				console.log(emoji);
			}
		}
	},
};

