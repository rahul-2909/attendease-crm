const express = require('express');
const {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/shift.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createLocationSchema,
  updateLocationSchema,
} = require('../validations/shift.validation');
const { protect } = require('../middlewares/auth.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('shifts'));

router.get('/', listLocations);
router.post('/', validate(createLocationSchema), createLocation);
router.patch('/:id', validate(updateLocationSchema), updateLocation);
router.delete('/:id', deleteLocation);

module.exports = router;
