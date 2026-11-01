const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const date = Joi.date().iso();

const projectStatuses = ['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

const createProjectSchema = Joi.object({
  name: Joi.string().min(2).max(120).required().trim(),
  code: Joi.string().max(30).allow('').trim(),
  client: Joi.string().max(120).allow('').trim(),
  manager: Joi.string().max(120).allow('').trim(),
  team: Joi.array().items(objectId).default([]),
  startDate: date.allow(null, ''),
  endDate: date.allow(null, ''),
  progress: Joi.number().min(0).max(100).default(0),
  status: Joi.string().valid(...projectStatuses).default('PLANNED'),
  description: Joi.string().max(1000).allow('').trim(),
  organizationId: objectId.optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().min(2).max(120).trim(),
  code: Joi.string().max(30).allow('').trim(),
  client: Joi.string().max(120).allow('').trim(),
  manager: Joi.string().max(120).allow('').trim(),
  team: Joi.array().items(objectId),
  startDate: date.allow(null, ''),
  endDate: date.allow(null, ''),
  progress: Joi.number().min(0).max(100),
  status: Joi.string().valid(...projectStatuses),
  description: Joi.string().max(1000).allow('').trim(),
  organizationId: objectId.optional(),
}).min(1);

module.exports = {
  createProjectSchema,
  updateProjectSchema,
};
