const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const { ATTENDANCE_STATUS } = require('../constants/attendanceStatus');
const { LEAVE_STATUS } = require('../constants/leaveStatus');
const { startOfDay } = require('../utils/date');
const { employeeScope } = require('./employee.service');
const { attendanceScope, dateRangeFilter } = require('./attendance.service');
const { leaveScope } = require('./leave.service');

const countByStatus = (records, status) =>
  records.filter((record) => record.status === status).length;

const intersectEmployeeIds = (scope, ids) => {
  if (!scope.employeeId) return ids;

  if (scope.employeeId.$in) {
    return scope.employeeId.$in.filter((id) =>
      ids.some((candidate) => String(candidate) === String(id))
    );
  }

  return ids.some((candidate) => String(candidate) === String(scope.employeeId))
    ? [scope.employeeId]
    : [];
};

const attendanceReport = async (user, query = {}) => {
  const scope = await attendanceScope(user, query);
  const filter = { ...scope };

  const range = dateRangeFilter(query.from, query.to);
  if (range) filter.date = range;

  if (query.departmentId) {
    const employeeFilter = await employeeScope(user, query);
    const employees = await Employee.find({
      ...employeeFilter,
      departmentId: query.departmentId,
    })
      .select('_id')
      .lean();

    const ids = intersectEmployeeIds(
      scope,
      employees.map((employee) => employee._id)
    );

    filter.employeeId = { $in: ids };
  }

  const records = await Attendance.find(filter)
    .populate('employeeId', 'name role')
    .sort({ date: 1 })
    .lean();

  const present = countByStatus(records, ATTENDANCE_STATUS.PRESENT);
  const late = countByStatus(records, ATTENDANCE_STATUS.LATE);
  const absent = countByStatus(records, ATTENDANCE_STATUS.ABSENT);
  const onLeave = countByStatus(records, ATTENDANCE_STATUS.ON_LEAVE);

  const byEmployee = new Map();

  records.forEach((record) => {
    const employeeId = String(record.employeeId?._id || record.employeeId);
    const entry = byEmployee.get(employeeId) || {
      employeeId,
      name: record.employeeId?.name || '',
      present: 0,
      late: 0,
      absent: 0,
      onLeave: 0,
      total: 0,
    };

    entry.total += 1;
    if (record.status === ATTENDANCE_STATUS.PRESENT) entry.present += 1;
    if (record.status === ATTENDANCE_STATUS.LATE) entry.late += 1;
    if (record.status === ATTENDANCE_STATUS.ABSENT) entry.absent += 1;
    if (record.status === ATTENDANCE_STATUS.ON_LEAVE) entry.onLeave += 1;

    byEmployee.set(employeeId, entry);
  });

  return {
    from: query.from ? startOfDay(query.from) : null,
    to: query.to ? startOfDay(query.to) : null,
    totals: {
      records: records.length,
      present,
      late,
      absent,
      onLeave,
      attendanceRate: records.length
        ? Number((((present + late) / records.length) * 100).toFixed(1))
        : 0,
    },
    byEmployee: Array.from(byEmployee.values()),
  };
};

const leaveReport = async (user, query = {}) => {
  const scope = await leaveScope(user, query);
  const filter = { ...scope };

  if (query.from || query.to) {
    filter.startDate = {};
    if (query.from) filter.startDate.$gte = startOfDay(query.from);
    if (query.to) {
      const end = startOfDay(query.to);
      end.setDate(end.getDate() + 1);
      filter.startDate.$lt = end;
    }
  }

  const leaves = await LeaveRequest.find(filter)
    .populate('employeeId', 'name role')
    .sort({ startDate: 1 })
    .lean();

  const byStatus = Object.values(LEAVE_STATUS).reduce((totals, status) => {
    totals[status] = leaves.filter((leave) => leave.status === status).length;
    return totals;
  }, {});

  const byType = leaves.reduce((totals, leave) => {
    totals[leave.type] = (totals[leave.type] || 0) + 1;
    return totals;
  }, {});

  return {
    from: query.from ? startOfDay(query.from) : null,
    to: query.to ? startOfDay(query.to) : null,
    totals: {
      requests: leaves.length,
      ...byStatus,
    },
    byType,
    requests: leaves,
  };
};

module.exports = {
  attendanceReport,
  leaveReport,
};
