const express = require('express');
const {
  listSalaries,
  updateSalary,
} = require('../controllers/salary.controller');
const validate = require('../middlewares/validate.middleware');
const { updateSalarySchema } = require('../validations/salary.validation');
const { protect } = require('../middlewares/auth.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('salary'));

router.get('/', listSalaries);
router.patch('/:employeeId', validate(updateSalarySchema), updateSalary);

module.exports = router;
