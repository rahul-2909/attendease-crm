const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { organizationFilter, resolveOrganizationId } = require('../utils/scope');

const notFound = () => {
  const error = new Error('Department not found');
  error.statusCode = 404;
  return error;
};

const listDepartments = async (user, query = {}) => {
  const departments = await Department.find(
    organizationFilter(user, query.organizationId)
  )
    .sort({ name: 1 })
    .lean();

  if (!departments.length) return departments;

  const counts = await Employee.aggregate([
    {
      $match: {
        departmentId: { $in: departments.map((department) => department._id) },
        isActive: true,
      },
    },
    { $group: { _id: '$departmentId', count: { $sum: 1 } } },
  ]);

  const countByDepartment = new Map(
    counts.map((entry) => [String(entry._id), entry.count])
  );

  return departments.map((department) => ({
    ...department,
    count: countByDepartment.get(String(department._id)) || 0,
  }));
};

const getDepartment = async (user, id) => {
  const department = await Department.findOne({
    _id: id,
    ...organizationFilter(user),
  }).lean();
  if (!department) throw notFound();
  return department;
};

const createDepartment = async (user, data) => {
  const organizationId = resolveOrganizationId(user, data.organizationId);
  if (!organizationId) {
    const error = new Error('organizationId is required');
    error.statusCode = 400;
    throw error;
  }
  return Department.create({
    name: data.name,
    manager: data.manager,
    organizationId,
  });
};

const updateDepartment = async (user, id, data) => {
  const department = await Department.findOneAndUpdate(
    { _id: id, ...organizationFilter(user) },
    data,
    { new: true, runValidators: true }
  );
  if (!department) throw notFound();
  return department;
};

const deleteDepartment = async (user, id) => {
  const department = await Department.findOneAndDelete({
    _id: id,
    ...organizationFilter(user),
  });
  if (!department) throw notFound();

  await Employee.updateMany(
    { departmentId: department._id },
    { $unset: { departmentId: 1 } }
  );

  return department;
};

module.exports = {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
