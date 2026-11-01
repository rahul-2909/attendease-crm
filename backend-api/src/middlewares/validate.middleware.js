const { loginSchema } = require('../validations/auth.validation');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(', '));
      err.statusCode = 400;
      return next(err);
    }
    next();
  };
};

module.exports = validate;
