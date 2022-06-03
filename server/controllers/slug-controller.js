'use strict';

const _ = require('lodash');
const { NotFoundError } = require('@strapi/utils/lib/errors');
const { getPluginService } = require('../utils/getPluginService');
const { transformResponse } = require('@strapi/strapi/lib/core-api/controller/transform');
const { sanitizeOutput } = require('../utils/sanitizeOutput');

module.exports = ({ strapi }) => ({
	async findOne(ctx) {
		const modelName = 'page';

		const dirs = (ctx.request.params.slug || 'index').split('/');
		const slug = dirs.pop();

		const { models } = getPluginService(strapi, 'settingsService').get();
		const { auth } = ctx.state;

		const { uid, field, contentType } = models[modelName];

		// add slug filter to any already existing query restrictions
		let query = ctx.query || {};
		if (!query.filters) {
			query.filters = {};
		}

		query.filters.category = {}

		query.filters[field] = slug;
		query.filters.category[field] = null;

		if (dirs.length > 0) {
			query.filters.category[field] = dirs.join('/');
		}

		// only return published entries by default if content type has draftAndPublish enabled
		if (_.get(contentType, ['options', 'draftAndPublish'], false) && !query.publicationState) {
			query.publicationState = 'live';
		}

		const data = await getPluginService(strapi, 'slugService').findOne(uid, query);

		if (data) {
			const sanitizedEntity = await sanitizeOutput(data, contentType, auth);
			ctx.body = transformResponse(sanitizedEntity, {}, { contentType });
		} else {
			throw new NotFoundError();
		}
	},


	async findByCategory(ctx) {
		const modelName = 'page';

		const { category } = ctx.request.params;

		const { models } = getPluginService(strapi, 'settingsService').get();
		const { auth } = ctx.state;

		const { uid, field, contentType } = models[modelName];

		// add slug filter to any already existing query restrictions
		let query = ctx.query || {};

		if (!query.filters) {
			query.filters = {};
		}

		query.filters.category = {}
		query.filters.category[field] = category;

		// only return published entries by default if content type has draftAndPublish enabled
		if (_.get(contentType, ['options', 'draftAndPublish'], false) && !query.publicationState) {
			query.publicationState = 'live';
		}

		let data = await getPluginService(strapi, 'slugService').findMany(uid, query);

		if (data.length > 0) {
			const sanitizedEntity = await sanitizeOutput(data, contentType, auth);
			ctx.body = transformResponse(sanitizedEntity, {}, { contentType });
		} else {
			throw new NotFoundError();
		}
	},
});
