const messages = {};

const getMessage = (orgId, messageId) => {
	console.log(`getDiscordMessages: ${orgId}, ${messageId}`);
	return messages[messageId];
};

const addMessage = (orgId, messageId, data) => messages[messageId] = data;
const hasMesssage = (orgId, messageId) => messageId in messages;
const removeMessage = (orgId, messageId) => delete messages[messageId];

module.exports = {
	getMessage,
	hasMesssage,
	removeMessage,
	addMessage,
};