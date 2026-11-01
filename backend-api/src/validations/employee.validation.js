const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const createEmployeeSchema = Joi.object({
  userId: objectId.optional(),
  name: Joi.string().min(2).max(80).required().trim(),
  employeeCode: Joi.string().max(30).allow('').trim(),
  role: Joi.string().max(80).trim(),
  email: Joi.string().email().allow('').trim(),
  phone: Joi.string().max(40).allow('').trim(),
  designation: Joi.string().max(80).allow('').trim(),
  salary: Joi.number().min(0).max(100000000),
  joiningDate: Joi.date().iso().allow(null, ''),
  projectId: objectId.allow(null),
  shiftId: objectId.allow(null),
  initials: Joi.string().max(4).trim(),
  color: Joi.string().max(20).trim(),
  departmentId: objectId.optional(),
  managerId: objectId.optional(),
  organizationId: objectId.optional(),
  isActive: Joi.boolean().default(true),
});

const updateEmployeeSchema = Joi.object({
  userId: objectId.allow(null),
  name: Joi.string().min(2).max(80).trim(),
  employeeCode: Joi.string().max(30).allow('').trim(),
  role: Joi.string().max(80).trim(),
  email: Joi.string().email().allow('').trim(),
  phone: Joi.string().max(40).allow('').trim(),
  designation: Joi.string().max(80).allow('').trim(),
  salary: Joi.number().min(0).max(100000000),
  joiningDate: Joi.date().iso().allow(null, ''),
  projectId: objectId.allow(null),
  shiftId: objectId.allow(null),
  initials: Joi.string().max(4).trim(),
  color: Joi.string().max(20).trim(),
  departmentId: objectId.allow(null),
  managerId: objectId.allow(null),
  organizationId: objectId,
  isActive: Joi.boolean(),
}).min(1);

module.exports = {
  createEmployeeSchema,
  updateEmployeeSchema,
};
