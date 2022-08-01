'use strict';

const _ = require('lodash');
const { NotFoundError } = require('@strapi/utils/lib/errors');
const { getPluginService } = require('../utils/getPluginService');
const { transformResponse } = require('@strapi/strapi/lib/core-api/controller/transform');
const { sanitizeOutput } = require('../utils/sanitizeOutput');

module.exports = ({ strapi }) => ({
	async findOne(ctx) {
		const { model, slug, category, categoryKey, ...query } = ctx.query

		const { models } = getPluginService(strapi, 'settingsService').get();
		const { auth } = ctx.state;

		const { uid, field, contentType } = models[model];

		// add slug filter to any already existing query restrictions
		if (!query.filters) {
			query.filters = {};
		}

		query.filters[field] = slug;

		if (categoryKey) {
			query.filters[categoryKey] = {}
			query.filters[categoryKey][field] = category || null;
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


	async findMany(ctx) {
		const { model, category, categoryKey, ...query } = ctx.query

		const { models } = getPluginService(strapi, 'settingsService').get();
		const { auth } = ctx.state;

		const { uid, field, contentType } = models[model];

		if (!query.filters) {
			query.filters = {};
		}

		if (categoryKey) {
			query.filters[categoryKey] = {}
			query.filters[categoryKey][field] = category || null;
		}

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
