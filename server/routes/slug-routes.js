'use strict';

module.exports = [
	{
		method: 'GET',
		path: '/items',
		handler: 'slugController.findMany',
	},
	{
		method: 'GET',
		path: '/page',
		handler: 'slugController.findOne',
	},
];
