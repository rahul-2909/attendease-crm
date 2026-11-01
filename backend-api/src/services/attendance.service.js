const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');
const Settings = require('../models/Settings');
const { ATTENDANCE_STATUS } = require('../constants/attendanceStatus');
const { startOfDay } = require('../utils/date');
const {
  isSuperAdmin,
  isOrgWide,
  isManager,
  organizationFilter,
} = require('../utils/scope');
const {
  getEmployeeByUser,
  getTeamEmployeeIds,
  employeeScope,
} = require('./employee.service');

const deriveInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const notFound = () => {
  const error = new Error('Attendance record not found');
  error.statusCode = 404;
  return error;
};

const attendanceScope = async (user, query = {}) => {
  if (isSuperAdmin(user)) {
    return organizationFilter(user, query.organizationId);
  }

  if (!user.organizationId) {
    return { employeeId: null };
  }

  if (isOrgWide(user)) {
    return { organizationId: user.organizationId };
  }

  if (isManager(user)) {
    const ids = await getTeamEmployeeIds(user);
    return { employeeId: { $in: ids } };
  }

  const employee = await getEmployeeByUser(user);
  return { employeeId: employee ? employee._id : null };
};

const applyEmployeeFilter = (scope, employeeId) => {
  if (!employeeId) return scope;
  if (scope.employeeId === null) return scope;

  if (scope.employeeId && scope.employeeId.$in) {
    return {
      ...scope,
      employeeId: {
        $in: scope.employeeId.$in.filter(
          (id) => String(id) === String(employeeId)
        ),
      },
    };
  }

  if (scope.employeeId && !scope.employeeId.$in) {
    return {
      ...scope,
      employeeId:
        String(scope.employeeId) === String(employeeId) ? scope.employeeId : null,
    };
  }

  return { ...scope, employeeId };
};

const dateRangeFilter = (from, to) => {
  if (!from && !to) return null;

  const range = {};
  if (from) range.$gte = startOfDay(from);
  if (to) {
    const end = startOfDay(to);
    end.setDate(end.getDate() + 1);
    range.$lt = end;
  }
  return range;
};

const toAttendanceResponse = (record) => {
  const employee = record.employeeId;
  return {
    id: record._id,
    employeeId: employee?._id || record.employeeId,
    name: employee?.name || '',
    role: employee?.role || '',
    initials: employee?.initials || deriveInitials(employee?.name),
    color: employee?.color || 'blue',
    date: record.date,
    checkIn: record.checkIn || null,
    checkOut: record.checkOut || null,
    status: record.status,
    notes: record.notes || '',
  };
};

const getOverview = async (user, query = {}) => {
  const date = startOfDay(query.date || new Date());
  const employeeFilter = await employeeScope(user, query);
  const attendanceFilter = await attendanceScope(user, query);

  const [totalEmployees, departments, records] = await Promise.all([
    Employee.countDocuments({ ...employeeFilter, isActive: true }),
    Department.countDocuments(organizationFilter(user, query.organizationId)),
    Attendance.find({ ...attendanceFilter, date })
      .populate('employeeId', 'name role initials color isActive')
      .sort({ checkIn: 1 })
      .lean(),
  ]);

  const attendance = records
    .filter((record) => record.employeeId && record.employeeId.isActive !== false)
    .map(toAttendanceResponse);

  const present = attendance.filter(
    (record) =>
      record.status === ATTENDANCE_STATUS.PRESENT ||
      record.status === ATTENDANCE_STATUS.LATE
  ).length;
  const lateArrivals = attendance.filter(
    (record) => record.status === ATTENDANCE_STATUS.LATE
  ).length;
  const onLeave = attendance.filter(
    (record) => record.status === ATTENDANCE_STATUS.ON_LEAVE
  ).length;

  const attendanceRate = totalEmployees
    ? Number(((present / totalEmployees) * 100).toFixed(1))
    : 0;

  const lastCheckIn = attendance.reduce((latest, record) => {
    if (!record.checkIn) return latest;
    if (!latest || new Date(record.checkIn) > new Date(latest)) {
      return record.checkIn;
    }
    return latest;
  }, null);

  return {
    date: date.toISOString(),
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
    stats: {
      totalEmployees,
      present,
      lateArrivals,
      onLeave,
      attendanceRate,
      departments,
    },
    attendance,
    summary: {
      employees: totalEmployees,
      departments,
      checkedIn: present,
      lastCheckIn,
      needAttention: lateArrivals,
    },
  };
};

const listAttendance = async (user, query = {}) => {
  const scope = await attendanceScope(user, query);
  const filter = applyEmployeeFilter(scope, query.employeeId);

  if (query.status) filter.status = query.status;

  const range = dateRangeFilter(query.from, query.to);
  if (range) filter.date = range;

  const records = await Attendance.find(filter)
    .populate('employeeId', 'name role initials color')
    .sort({ date: -1, checkIn: 1 })
    .lean();

  return records.map(toAttendanceResponse);
};

const getMyAttendance = async (user, query = {}) => {
  const employee = await getEmployeeByUser(user);
  if (!employee) {
    const error = new Error('Employee profile not found');
    error.statusCode = 404;
    throw error;
  }

  return listAttendance(user, { ...query, employeeId: employee._id });
};

const parseStartMinutes = (startTime = '09:00') => {
  const [hours, minutes] = startTime.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const isLate = async (employee, date) => {
  let startMinutes = 9 * 60;
  let graceMinutes = 10;

  if (employee.shiftId) {
    const shift = await Shift.findById(employee.shiftId)
      .select('startTime graceMinutes')
      .lean();
    if (shift) {
      startMinutes = parseStartMinutes(shift.startTime);
      graceMinutes = shift.graceMinutes ?? graceMinutes;
    }
  } else {
    const settings = await Settings.findOne({
      organizationId: employee.organizationId,
    })
      .select('graceMinutes')
      .lean();
    graceMinutes = settings?.graceMinutes ?? graceMinutes;
  }

  const threshold = new Date(date);
  threshold.setHours(0, 0, 0, 0);
  threshold.setMinutes(startMinutes + graceMinutes);

  return date > threshold;
};

const checkIn = async (user) => {
  const employee = await getEmployeeByUser(user);
  if (!employee) {
    const error = new Error('Employee profile not found');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  const date = startOfDay(now);
  const status = (await isLate(employee, now))
    ? ATTENDANCE_STATUS.LATE
    : ATTENDANCE_STATUS.PRESENT;

  let record = await Attendance.findOne({ employeeId: employee._id, date });

  if (record && record.checkIn) {
    const error = new Error('Already checked in today');
    error.statusCode = 400;
    throw error;
  }

  if (record) {
    record.checkIn = now;
    record.status = status;
    await record.save();
  } else {
    record = await Attendance.create({
      employeeId: employee._id,
      organizationId: employee.organizationId,
      date,
      checkIn: now,
      status,
    });
  }

  const populated = await record.populate('employeeId', 'name role initials color');
  return toAttendanceResponse(populated.toObject());
};

const checkOut = async (user) => {
  const employee = await getEmployeeByUser(user);
  if (!employee) {
    const error = new Error('Employee profile not found');
    error.statusCode = 404;
    throw error;
  }

  const date = startOfDay(new Date());
  const record = await Attendance.findOne({ employeeId: employee._id, date });

  if (!record || !record.checkIn) {
    const error = new Error('Check in before checking out');
    error.statusCode = 400;
    throw error;
  }

  if (record.checkOut) {
    const error = new Error('Already checked out today');
    error.statusCode = 400;
    throw error;
  }

  record.checkOut = new Date();
  await record.save();

  const populated = await record.populate('employeeId', 'name role initials color');
  return toAttendanceResponse(populated.toObject());
};

const findScopedEmployee = async (user, employeeId) => {
  const filter = await employeeScope(user);
  const employee = await Employee.findOne({ ...filter, _id: employeeId });
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  return employee;
};

const markAttendance = async (user, data) => {
  const employee = await findScopedEmployee(user, data.employeeId);
  const date = startOfDay(data.date || new Date());

  const updates = {
    checkIn: data.checkIn || null,
    checkOut: data.checkOut || null,
    notes: data.notes,
  };

  if (data.status) {
    updates.status = data.status;
  } else if (data.checkIn) {
    updates.status = (await isLate(employee, new Date(data.checkIn)))
      ? ATTENDANCE_STATUS.LATE
      : ATTENDANCE_STATUS.PRESENT;
  }

  const record = await Attendance.findOneAndUpdate(
    { employeeId: employee._id, date },
    {
      $set: {
        ...updates,
        employeeId: employee._id,
        organizationId: employee.organizationId,
        date,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  )
    .populate('employeeId', 'name role initials color')
    .lean();

  return toAttendanceResponse(record);
};

const updateAttendance = async (user, id, data) => {
  const scope = await attendanceScope(user);
  const record = await Attendance.findOneAndUpdate(
    { ...scope, _id: id },
    data,
    { new: true, runValidators: true }
  )
    .populate('employeeId', 'name role initials color')
    .lean();

  if (!record) throw notFound();
  return toAttendanceResponse(record);
};

module.exports = {
  getOverview,
  listAttendance,
  getMyAttendance,
  checkIn,
  checkOut,
  markAttendance,
  updateAttendance,
  attendanceScope,
  applyEmployeeFilter,
  dateRangeFilter,
  toAttendanceResponse,
};
