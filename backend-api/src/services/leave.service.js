const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');
const { LEAVE_STATUS } = require('../constants/leaveStatus');
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
const { applyEmployeeFilter } = require('./attendance.service');

const notFound = () => {
  const error = new Error('Leave request not found');
  error.statusCode = 404;
  return error;
};

const leaveScope = async (user, query = {}) => {
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

const resolveEmployee = async (user, employeeId) => {
  if (employeeId) {
    const filter = await employeeScope(user);
    const employee = await Employee.findOne({ ...filter, _id: employeeId });
    if (!employee) {
      const error = new Error('Employee not found');
      error.statusCode = 404;
      throw error;
    }
    return employee;
  }

  const employee = await getEmployeeByUser(user);
  if (!employee) {
    const error = new Error('Employee profile not found');
    error.statusCode = 404;
    throw error;
  }
  return employee;
};

const applyLeave = async (user, data) => {
  const employee = await resolveEmployee(user, data.employeeId);

  return LeaveRequest.create({
    employeeId: employee._id,
    organizationId: employee.organizationId,
    type: data.type,
    startDate: startOfDay(data.startDate),
    endDate: startOfDay(data.endDate),
    reason: data.reason,
  });
};

const listLeaves = async (user, query = {}) => {
  const scope = await leaveScope(user, query);
  const filter = applyEmployeeFilter(scope, query.employeeId);

  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;

  if (query.from || query.to) {
    filter.startDate = {};
    if (query.from) filter.startDate.$gte = startOfDay(query.from);
    if (query.to) {
      const end = startOfDay(query.to);
      end.setDate(end.getDate() + 1);
      filter.startDate.$lt = end;
    }
  }

  return LeaveRequest.find(filter)
    .populate('employeeId', 'name role initials color')
    .populate('reviewedBy', 'name role')
    .sort({ createdAt: -1 })
    .lean();
};

const getLeave = async (user, id) => {
  const leave = await LeaveRequest.findOne({
    ...(await leaveScope(user)),
    _id: id,
  })
    .populate('employeeId', 'name role initials color')
    .populate('reviewedBy', 'name role')
    .lean();

  if (!leave) throw notFound();
  return leave;
};

const reviewLeave = async (user, id, data) => {
  const leave = await LeaveRequest.findOne({
    ...(await leaveScope(user)),
    _id: id,
  });

  if (!leave) throw notFound();

  if (leave.status !== LEAVE_STATUS.PENDING) {
    const error = new Error('Only pending leave requests can be reviewed');
    error.statusCode = 400;
    throw error;
  }

  leave.status = data.status;
  leave.reviewedBy = user._id;
  leave.reviewedAt = new Date();
  leave.reviewNote = data.reviewNote;

  await leave.save();

  return leave;
};

const cancelLeave = async (user, id) => {
  const leave = await LeaveRequest.findOne({
    _id: id,
    ...(await leaveScope(user)),
  });

  if (!leave) throw notFound();

  if (leave.status !== LEAVE_STATUS.PENDING) {
    const error = new Error('Only pending leave requests can be cancelled');
    error.statusCode = 400;
    throw error;
  }

  leave.status = LEAVE_STATUS.CANCELLED;
  await leave.save();

  return leave;
};

const deleteLeave = async (user, id) => {
  const leave = await LeaveRequest.findOneAndDelete({
    _id: id,
    ...(await leaveScope(user)),
  });
  if (!leave) throw notFound();
  return leave;
};

module.exports = {
  leaveScope,
  applyLeave,
  listLeaves,
  getLeave,
  reviewLeave,
  cancelLeave,
  deleteLeave,
};
