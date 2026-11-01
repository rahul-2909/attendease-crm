const attendanceService = require('../services/attendance.service');
const { success } = require('../utils/response');

const getOverview = async (req, res, next) => {
  try {
    const overview = await attendanceService.getOverview(req.user, req.query);
    return success(res, overview, 'Attendance overview retrieved');
  } catch (error) {
    next(error);
  }
};

const listAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.listAttendance(req.user, req.query);
    return success(res, records, 'Attendance retrieved');
  } catch (error) {
    next(error);
  }
};

const getMyAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getMyAttendance(req.user, req.query);
    return success(res, records, 'Attendance retrieved');
  } catch (error) {
    next(error);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const record = await attendanceService.checkIn(req.user);
    return success(res, record, 'Checked in', 201);
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const record = await attendanceService.checkOut(req.user);
    return success(res, record, 'Checked out');
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const record = await attendanceService.markAttendance(req.user, req.body);
    return success(res, record, 'Attendance saved', 201);
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const record = await attendanceService.updateAttendance(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, record, 'Attendance updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  listAttendance,
  getMyAttendance,
  checkIn,
  checkOut,
  markAttendance,
  updateAttendance,
};
