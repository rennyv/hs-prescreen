const config = require('../config.json');
const { Events } = require('discord.js');
const { approveMessage, rejectMessage } = require('../utils/hootsuite');
const { getMessage, hasMesssage, removeMessage } = require('../utils/discord');

module.exports = {
	name: Events.MessageReactionAdd,
	once: false,
	execute(reaction, user) {
		if (!user) { console.log('Empty user'); }
		console.log('reaction:', reaction);
		const message = reaction.message, emoji = reaction.emoji;
		const orgId = config.CHANNEL_ORG[reaction.message.channelId];
		if (hasMesssage(orgId, message.id)) {
			switch (emoji.name) {
			case config.EMOJI.approved:
				approveMessage(getMessage(orgId, message.id));
				removeMessage(orgId, message.id);
				break;
			case config.EMOJI.reject:
				rejectMessage(getMessage(orgId, message.id));
				removeMessage(orgId, message.id);
				break;
			default:
				console.log(emoji);
			}
		}
	},
};

