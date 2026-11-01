const shiftService = require('../services/shift.service');
const { success } = require('../utils/response');

const listShifts = async (req, res, next) => {
  try {
    return success(res, await shiftService.listShifts(req.user, req.query), 'Shifts retrieved');
  } catch (error) {
    next(error);
  }
};

const createShift = async (req, res, next) => {
  try {
    return success(res, await shiftService.createShift(req.user, req.body), 'Shift created', 201);
  } catch (error) {
    next(error);
  }
};

const updateShift = async (req, res, next) => {
  try {
    return success(
      res,
      await shiftService.updateShift(req.user, req.params.id, req.body),
      'Shift updated'
    );
  } catch (error) {
    next(error);
  }
};

const deleteShift = async (req, res, next) => {
  try {
    return success(res, await shiftService.deleteShift(req.user, req.params.id), 'Shift deleted');
  } catch (error) {
    next(error);
  }
};

const listLocations = async (req, res, next) => {
  try {
    return success(
      res,
      await shiftService.listLocations(req.user, req.query),
      'Locations retrieved'
    );
  } catch (error) {
    next(error);
  }
};

const createLocation = async (req, res, next) => {
  try {
    return success(
      res,
      await shiftService.createLocation(req.user, req.body),
      'Location created',
      201
    );
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    return success(
      res,
      await shiftService.updateLocation(req.user, req.params.id, req.body),
      'Location updated'
    );
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    return success(
      res,
      await shiftService.deleteLocation(req.user, req.params.id),
      'Location deleted'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};
