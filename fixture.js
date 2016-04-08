'use strict';
var Promise = require('bluebird');
var loudRejection = require('./');

loudRejection();

var promises = {};

console.log('started');

function reject(key, reason) {
	// IMPORTANT: key is always logged to stdout
	// Make sure to remember that when grepping output (keep key and message different).
	console.log('Rejecting:', key);
	promises[key] = new Promise(function (resolve, reject) {
		reject(reason);
	});
}

function handle(key) {
	promises[key].catch(function () {});
}

process.on('message', function (message) {
	switch (message.action) {
		case 'reject-error': return reject(message.key, new Error(message.message));
		case 'reject-value': return reject(message.key, message.value);
		case 'reject-nothing': return reject(message.key);
		case 'reinstall': return loudRejection();
		case 'handle': return handle(message.key);
		default:
			console.error('Unknown message received:', message);
			process.exit(1);
	}
});

process.send({status: 'ready'});

setTimeout(function () {}, 30000);
