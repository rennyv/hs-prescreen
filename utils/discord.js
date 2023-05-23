const messages = {};

const getMessage = (orgId, messageId) => {
	console.log(`getMessage: ${orgId}, ${messageId}`);
	return messages[`${orgId},${messageId}`];
};

const addMessage = (orgId, messageId, data) => {
	console.log(`addMessage: ${orgId}, ${messageId}`, data);
	messages[`${orgId},${messageId}`] = data;
	console.log('current messages:', messages);
};

const hasMesssage = (orgId, messageId) => {
	console.log(`hasMesssage: ${orgId}, ${messageId}`);
	return (`${orgId},${messageId}`) in messages;
};

const removeMessage = (orgId, messageId) => {
	console.log(`removeMessage: ${orgId}, ${messageId}`);
	delete messages[`${orgId},${messageId}`];
};

module.exports = {
	getMessage,
	hasMesssage,
	removeMessage,
	addMessage,
};