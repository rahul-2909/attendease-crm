const departmentService = require('../services/department.service');
const { success } = require('../utils/response');

const listDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.listDepartments(req.user, req.query);
    return success(res, departments, 'Departments retrieved');
  } catch (error) {
    next(error);
  }
};

const getDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.getDepartment(req.user, req.params.id);
    return success(res, department, 'Department retrieved');
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.user, req.body);
    return success(res, department, 'Department created', 201);
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, department, 'Department updated');
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.deleteDepartment(
      req.user,
      req.params.id
    );
    return success(res, department, 'Department deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
