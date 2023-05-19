const request = require('request');
const config = require('../config.json');

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

const getToken = (orgId) => {
	console.log(orgId);
	return currentToken;
};

const rejectMessage = (messageInfo, reason) => {
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
};

const approveMessage = (messageInfo) => {
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
};

module.exports = {
	approveMessage,
	rejectMessage,
	getToken,
};