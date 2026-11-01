const Joi = require('joi');
const { ATTENDANCE_STATUS } = require('../constants/attendanceStatus');

const objectId = Joi.string().hex().length(24);
const date = Joi.date().iso();

const markAttendanceSchema = Joi.object({
  employeeId: objectId.required(),
  date: date.optional(),
  checkIn: date.allow(null),
  checkOut: date.allow(null),
  status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)),
  notes: Joi.string().max(500).allow('').trim(),
});

const updateAttendanceSchema = Joi.object({
  checkIn: date.allow(null),
  checkOut: date.allow(null),
  status: Joi.string().valid(...Object.values(ATTENDANCE_STATUS)),
  notes: Joi.string().max(500).allow('').trim(),
}).min(1);

module.exports = {
  markAttendanceSchema,
  updateAttendanceSchema,
};
