const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required(),
});

const bootstrapSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  phone: Joi.string().required().trim(),
  password: Joi.string().min(8).max(72).required(),
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  phone: Joi.string().min(6).max(30).required().trim(),
  password: Joi.string().min(6).max(72).required(),
  companyName: Joi.string().min(2).max(120).allow('').trim(),
});

module.exports = {
  loginSchema,
  registerSchema,
  bootstrapSchema,
};
