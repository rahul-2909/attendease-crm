const express = require('express');
const {
  getSettings,
  updateSettings,
} = require('../controllers/settings.controller');
const validate = require('../middlewares/validate.middleware');
const { updateSettingsSchema } = require('../validations/settings.validation');
const { protect } = require('../middlewares/auth.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('settings'));

router.get('/', getSettings);
router.patch('/', validate(updateSettingsSchema), updateSettings);

module.exports = router;
