const leaveService = require('../services/leave.service');
const { success } = require('../utils/response');

const applyLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.applyLeave(req.user, req.body);
    return success(res, leave, 'Leave request submitted', 201);
  } catch (error) {
    next(error);
  }
};

const listLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.listLeaves(req.user, req.query);
    return success(res, leaves, 'Leave requests retrieved');
  } catch (error) {
    next(error);
  }
};

const getLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.getLeave(req.user, req.params.id);
    return success(res, leave, 'Leave request retrieved');
  } catch (error) {
    next(error);
  }
};

const reviewLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.reviewLeave(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, leave, 'Leave request reviewed');
  } catch (error) {
    next(error);
  }
};

const cancelLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.cancelLeave(req.user, req.params.id);
    return success(res, leave, 'Leave request cancelled');
  } catch (error) {
    next(error);
  }
};

const deleteLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.deleteLeave(req.user, req.params.id);
    return success(res, leave, 'Leave request deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  listLeaves,
  getLeave,
  reviewLeave,
  cancelLeave,
  deleteLeave,
};
