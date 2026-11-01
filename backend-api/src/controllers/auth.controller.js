const authService = require('../services/auth.service');
const { success } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return success(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return success(res, result, 'Account created', 201);
  } catch (error) {
    next(error);
  }
};

const bootstrap = async (req, res, next) => {
  try {
    const user = await authService.bootstrapSuperAdmin(req.body);
    return success(res, user, 'Super admin created', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  bootstrap,
};
