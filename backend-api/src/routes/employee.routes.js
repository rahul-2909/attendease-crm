const express = require('express');
const {
  listEmployees,
  getMyEmployee,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employee.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createEmployeeSchema,
  updateEmployeeSchema,
} = require('../validations/employee.validation');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('employees'));

router.get('/me', requirePermission(PERMISSIONS.EMPLOYEE_READ), getMyEmployee);
router.get('/', requirePermission(PERMISSIONS.EMPLOYEE_READ), listEmployees);
router.post(
  '/',
  requirePermission(PERMISSIONS.EMPLOYEE_CREATE),
  validate(createEmployeeSchema),
  createEmployee
);
router.get('/:id', requirePermission(PERMISSIONS.EMPLOYEE_READ), getEmployee);
router.patch(
  '/:id',
  requirePermission(PERMISSIONS.EMPLOYEE_UPDATE),
  validate(updateEmployeeSchema),
  updateEmployee
);
router.delete(
  '/:id',
  requirePermission(PERMISSIONS.EMPLOYEE_DELETE),
  deleteEmployee
);

module.exports = router;
