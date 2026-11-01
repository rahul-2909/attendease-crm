const reportService = require('../services/report.service');
const { success } = require('../utils/response');

const attendanceReport = async (req, res, next) => {
  try {
    const report = await reportService.attendanceReport(req.user, req.query);
    return success(res, report, 'Attendance report retrieved');
  } catch (error) {
    next(error);
  }
};

const leaveReport = async (req, res, next) => {
  try {
    const report = await reportService.leaveReport(req.user, req.query);
    return success(res, report, 'Leave report retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  attendanceReport,
  leaveReport,
};
