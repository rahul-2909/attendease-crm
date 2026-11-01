const express = require('express');
const { login, register, bootstrap } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const {
  loginSchema,
  registerSchema,
  bootstrapSchema,
} = require('../validations/auth.validation');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/bootstrap', validate(bootstrapSchema), bootstrap);

module.exports = router;
