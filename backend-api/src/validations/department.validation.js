const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createDepartmentSchema = Joi.object({
  name: Joi.string().min(2).max(80).required().trim(),
  manager: Joi.string().max(80).allow('').trim(),
  organizationId: objectId.optional(),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(2).max(80).trim(),
  manager: Joi.string().max(80).allow('').trim(),
  organizationId: objectId.optional(),
}).min(1);

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
};
