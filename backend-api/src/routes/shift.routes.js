const express = require('express');
const {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
} = require('../controllers/shift.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createShiftSchema,
  updateShiftSchema,
} = require('../validations/shift.validation');
const { protect } = require('../middlewares/auth.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('shifts'));

router.get('/', listShifts);
router.post('/', validate(createShiftSchema), createShift);
router.patch('/:id', validate(updateShiftSchema), updateShift);
router.delete('/:id', deleteShift);

module.exports = router;
