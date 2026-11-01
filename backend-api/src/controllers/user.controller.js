const userService = require('../services/user.service');
const { success } = require('../utils/response');

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.user, req.body);
    return success(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers(req.user, req.query);
    return success(res, users, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUser(req.user, req.params.id);
    return success(res, user, 'User retrieved');
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, user, 'User updated');
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.user, req.params.id);
    return success(res, user, 'User deactivated');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user);
    return success(res, profile, 'Profile retrieved');
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await userService.updateProfile(req.user, req.body);
    return success(res, profile, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
};
