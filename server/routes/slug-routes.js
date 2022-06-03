'use strict';

module.exports = [
	{
		method: 'GET',
		path: '/category/:category*',
		handler: 'slugController.findByCategory',
	},
	{
		method: 'GET',
		path: '/:slug*',
		handler: 'slugController.findOne',
	},
];
