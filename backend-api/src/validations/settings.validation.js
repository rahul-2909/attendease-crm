const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const updateSettingsSchema = Joi.object({
  organizationId: objectId.optional(),
  companyName: Joi.string().max(120).allow('').trim(),
  companyEmail: Joi.string().email().allow('').trim(),
  companyPhone: Joi.string().max(40).allow('').trim(),
  companyAddress: Joi.string().max(300).allow('').trim(),
  graceMinutes: Joi.number().min(0).max(240),
  gpsEnabled: Joi.boolean(),
  qrEnabled: Joi.boolean(),
  manualEnabled: Joi.boolean(),
  lateAlertsEnabled: Joi.boolean(),
  leaveEnabled: Joi.boolean(),
  checkoutReminderEnabled: Joi.boolean(),
  plan: Joi.string().max(60).trim(),
  employeeLimit: Joi.number().min(1).max(100000),
  renewalDate: Joi.date().iso().allow(null),
}).min(1);

module.exports = { updateSettingsSchema };
