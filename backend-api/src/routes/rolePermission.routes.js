const express = require('express');
const {
  listPermissions,
  getPermissions,
  updatePermission,
} = require('../controllers/rolePermission.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('permissions'));

router.get('/', listPermissions);
router.get('/:role', getPermissions);
router.patch('/:role', updatePermission);

module.exports = router;
