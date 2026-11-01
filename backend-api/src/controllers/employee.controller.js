const employeeService = require('../services/employee.service');
const { success } = require('../utils/response');

const listEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.listEmployees(req.user, req.query);
    return success(res, employees, 'Employees retrieved');
  } catch (error) {
    next(error);
  }
};

const getMyEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getMyEmployee(req.user);
    return success(res, employee, 'Employee profile retrieved');
  } catch (error) {
    next(error);
  }
};

const getEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployee(req.user, req.params.id);
    return success(res, employee, 'Employee retrieved');
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.user, req.body);
    return success(res, employee, 'Employee created', 201);
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, employee, 'Employee updated');
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.deleteEmployee(req.user, req.params.id);
    return success(res, employee, 'Employee deactivated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listEmployees,
  getMyEmployee,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
