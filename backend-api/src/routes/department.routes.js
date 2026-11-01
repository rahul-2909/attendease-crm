const express = require('express');
const {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
} = require('../validations/department.validation');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('departments'));

router.get('/', requirePermission(PERMISSIONS.DEPARTMENT_READ), listDepartments);
router.post(
  '/',
  requirePermission(PERMISSIONS.DEPARTMENT_CREATE),
  validate(createDepartmentSchema),
  createDepartment
);
router.get('/:id', requirePermission(PERMISSIONS.DEPARTMENT_READ), getDepartment);
router.patch(
  '/:id',
  requirePermission(PERMISSIONS.DEPARTMENT_UPDATE),
  validate(updateDepartmentSchema),
  updateDepartment
);
router.delete('/:id', requirePermission(PERMISSIONS.DEPARTMENT_DELETE), deleteDepartment);

module.exports = router;
