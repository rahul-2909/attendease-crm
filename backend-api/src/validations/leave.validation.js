const Joi = require('joi');
const { LEAVE_STATUS, LEAVE_TYPES } = require('../constants/leaveStatus');

const objectId = Joi.string().hex().length(24);
const date = Joi.date().iso();

const createLeaveSchema = Joi.object({
  employeeId: objectId.optional(),
  type: Joi.string().valid(...LEAVE_TYPES).required(),
  startDate: date.required(),
  endDate: date.min(Joi.ref('startDate')).required(),
  reason: Joi.string().max(500).allow('').trim(),
});

const reviewLeaveSchema = Joi.object({
  status: Joi.string()
    .valid(LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED)
    .required(),
  reviewNote: Joi.string().max(500).allow('').trim(),
});

module.exports = {
  createLeaveSchema,
  reviewLeaveSchema,
};
