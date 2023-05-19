const messages = {};

const getMessage = (orgId, messageId) => {
	console.log(`getMessage: ${orgId}, ${messageId}`);
	return messages[messageId];
};

const addMessage = (orgId, messageId, data) => {
	console.log(`addMessage: ${orgId}, ${messageId}`, data);
	messages[messageId] = data;
	console.log('current messages:', messages);
};

const hasMesssage = (orgId, messageId) => {
	console.log(`hasMesssage: ${orgId}, ${messageId}`);
	return messageId in messages;
};

const removeMessage = (orgId, messageId) => {
	console.log(`removeMessage: ${orgId}, ${messageId}`);
	delete messages[messageId];
};

module.exports = {
	getMessage,
	hasMesssage,
	removeMessage,
	addMessage,
};