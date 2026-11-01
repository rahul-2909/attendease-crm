const salaryService = require('../services/salary.service');
const { success } = require('../utils/response');

const listSalaries = async (req, res, next) => {
  try {
    return success(res, await salaryService.listSalaries(req.user, req.query), 'Salaries retrieved');
  } catch (error) {
    next(error);
  }
};

const updateSalary = async (req, res, next) => {
  try {
    const employee = await salaryService.updateSalary(
      req.user,
      req.params.employeeId,
      req.body.salary
    );
    return success(res, employee, 'Salary updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { listSalaries, updateSalary };
