'use strict';

module.exports = [
	{
		method: 'GET',
		path: '/category/:modelName/:category*',
		handler: 'slugController.findByCategory',
	},
	{
		method: 'GET',
		path: '/:modelName/:slug*',
		handler: 'slugController.findOne',
	},
];
