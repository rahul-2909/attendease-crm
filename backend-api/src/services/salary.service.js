const Employee = require('../models/Employee');
const { employeeScope } = require('./employee.service');

const notFound = () => {
  const error = new Error('Employee not found');
  error.statusCode = 404;
  return error;
};

const listSalaries = async (user, query = {}) => {
  const filter = await employeeScope(user, query);

  if (query.search) {
    filter.name = new RegExp(query.search, 'i');
  }

  if (query.departmentId) {
    filter.departmentId = query.departmentId;
  }

  return Employee.find(filter)
    .populate('departmentId', 'name')
    .populate('projectId', 'name')
    .populate('shiftId', 'name')
    .sort({ name: 1 })
    .lean();
};

const updateSalary = async (user, employeeId, salary) => {
  const filter = await employeeScope(user);
  const employee = await Employee.findOneAndUpdate(
    { ...filter, _id: employeeId },
    { salary },
    { new: true, runValidators: true }
  )
    .populate('departmentId', 'name')
    .lean();

  if (!employee) throw notFound();
  return employee;
};

module.exports = { listSalaries, updateSalary };
