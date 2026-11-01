const Joi = require('joi');
const { ROLE_VALUES } = require('../constants/roles');

const objectId = Joi.string().hex().length(24);

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  phone: Joi.string().required().trim(),
  password: Joi.string().min(8).max(72).optional(),
  role: Joi.string().valid(...ROLE_VALUES).default('EMPLOYEE'),
  isActive: Joi.boolean().default(true),
  organizationId: objectId.optional(),
  departmentId: objectId.optional(),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  email: Joi.string().email().lowercase().trim(),
  phone: Joi.string().trim(),
  password: Joi.string().min(8).max(72),
  role: Joi.string().valid(...ROLE_VALUES),
  isActive: Joi.boolean(),
  organizationId: objectId,
  departmentId: objectId.allow(null),
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema,
};
