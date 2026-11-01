const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Shift = require('../models/Shift');
const {
  isSuperAdmin,
  isOrgWide,
  isManager,
  organizationFilter,
  resolveOrganizationId,
} = require('../utils/scope');

const notFound = () => {
  const error = new Error('Employee not found');
  error.statusCode = 404;
  return error;
};

const getEmployeeByUser = async (user) => {
  if (!user) return null;
  return Employee.findOne({ userId: user._id, isActive: true });
};

const getTeamEmployeeIds = async (user) => {
  const manager = await getEmployeeByUser(user);
  if (!manager) return [];

  const team = await Employee.find({
    managerId: manager._id,
    isActive: true,
  })
    .select('_id')
    .lean();

  return [manager._id, ...team.map((member) => member._id)];
};

const employeeScope = async (user, query = {}) => {
  if (isSuperAdmin(user)) {
    return organizationFilter(user, query.organizationId);
  }

  if (!user.organizationId) {
    return { _id: null };
  }

  if (isOrgWide(user)) {
    return { organizationId: user.organizationId };
  }

  if (isManager(user)) {
    const ids = await getTeamEmployeeIds(user);
    return { _id: { $in: ids } };
  }

  return { userId: user._id };
};

const listEmployees = async (user, query = {}) => {
  const filter = await employeeScope(user, query);

  if (query.departmentId) {
    filter.departmentId = query.departmentId;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === true || query.isActive === 'true';
  }

  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { employeeCode: new RegExp(query.search, 'i') },
      { email: new RegExp(query.search, 'i') },
    ];
  }

  return Employee.find(filter)
    .populate('departmentId', 'name')
    .populate('managerId', 'name')
    .populate('projectId', 'name code')
    .populate('shiftId', 'name startTime endTime')
    .sort({ name: 1 })
    .lean();
};

const getEmployee = async (user, id) => {
  const filter = await employeeScope(user);
  const employee = await Employee.findOne({ ...filter, _id: id })
    .populate('departmentId', 'name')
    .populate('managerId', 'name')
    .populate('projectId', 'name code')
    .populate('shiftId', 'name startTime endTime')
    .lean();
  if (!employee) throw notFound();
  return employee;
};

const getMyEmployee = async (user) => {
  const employee = await Employee.findOne({ userId: user._id })
    .populate('departmentId', 'name')
    .populate('managerId', 'name')
    .lean();
  if (!employee) throw notFound();
  return employee;
};

const assertRelated = async (Model, organizationId, id, label) => {
  if (!id) return;
  const document = await Model.findOne({ _id: id, organizationId });
  if (!document) {
    const error = new Error(`${label} does not belong to this organization`);
    error.statusCode = 400;
    throw error;
  }
};

const assertDepartment = (organizationId, departmentId) =>
  assertRelated(Department, organizationId, departmentId, 'Department');

const assertProject = (organizationId, projectId) =>
  assertRelated(Project, organizationId, projectId, 'Project');

const assertShift = (organizationId, shiftId) =>
  assertRelated(Shift, organizationId, shiftId, 'Shift');

const assertRelations = async (organizationId, data) => {
  await Promise.all([
    assertDepartment(organizationId, data.departmentId),
    assertProject(organizationId, data.projectId),
    assertShift(organizationId, data.shiftId),
  ]);
};

const createEmployee = async (user, data) => {
  const organizationId = resolveOrganizationId(user, data.organizationId);
  if (!organizationId) {
    const error = new Error('organizationId is required');
    error.statusCode = 400;
    throw error;
  }

  await assertRelations(organizationId, data);

  return Employee.create({ ...data, organizationId });
};

const updateEmployee = async (user, id, data) => {
  const filter = await employeeScope(user);
  const existing = await Employee.findOne({ ...filter, _id: id });
  if (!existing) throw notFound();

  await assertRelations(existing.organizationId, data);

  const employee = await Employee.findOneAndUpdate(
    { ...filter, _id: id },
    data,
    { new: true, runValidators: true }
  );
  if (!employee) throw notFound();
  return employee;
};

const deleteEmployee = async (user, id) => {
  const filter = await employeeScope(user);
  const employee = await Employee.findOneAndUpdate(
    { ...filter, _id: id },
    { isActive: false },
    { new: true }
  );
  if (!employee) throw notFound();
  return employee;
};

module.exports = {
  getEmployeeByUser,
  getTeamEmployeeIds,
  employeeScope,
  listEmployees,
  getEmployee,
  getMyEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
