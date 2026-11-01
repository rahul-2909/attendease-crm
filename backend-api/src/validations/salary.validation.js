const Joi = require('joi');

const updateSalarySchema = Joi.object({
  salary: Joi.number().min(0).max(100000000).required(),
});

module.exports = { updateSalarySchema };
