const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createOrganizationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  slug: Joi.string().min(2).max(60).lowercase().trim(),
  domain: Joi.string().hostname().lowercase().trim(),
  isActive: Joi.boolean().default(true),
});

const updateOrganizationSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  slug: Joi.string().min(2).max(60).lowercase().trim(),
  domain: Joi.string().hostname().lowercase().trim(),
  isActive: Joi.boolean(),
}).min(1);

module.exports = {
  createOrganizationSchema,
  updateOrganizationSchema,
  objectId,
};
