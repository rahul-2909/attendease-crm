const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const time = Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/);

const createShiftSchema = Joi.object({
  name: Joi.string().min(2).max(80).required().trim(),
  startTime: time.default('09:00'),
  endTime: time.default('18:00'),
  graceMinutes: Joi.number().min(0).max(240).default(10),
  breakMinutes: Joi.number().min(0).max(240).default(60),
  isActive: Joi.boolean().default(true),
  organizationId: objectId.optional(),
});

const updateShiftSchema = Joi.object({
  name: Joi.string().min(2).max(80).trim(),
  startTime: time,
  endTime: time,
  graceMinutes: Joi.number().min(0).max(240),
  breakMinutes: Joi.number().min(0).max(240),
  isActive: Joi.boolean(),
  organizationId: objectId.optional(),
}).min(1);

const createLocationSchema = Joi.object({
  name: Joi.string().min(2).max(120).required().trim(),
  address: Joi.string().max(250).allow('').trim(),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  radius: Joi.number().min(0).max(100000).default(100),
  isActive: Joi.boolean().default(true),
  organizationId: objectId.optional(),
});

const updateLocationSchema = Joi.object({
  name: Joi.string().min(2).max(120).trim(),
  address: Joi.string().max(250).allow('').trim(),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  radius: Joi.number().min(0).max(100000),
  isActive: Joi.boolean(),
  organizationId: objectId.optional(),
}).min(1);

module.exports = {
  createShiftSchema,
  updateShiftSchema,
  createLocationSchema,
  updateLocationSchema,
};
