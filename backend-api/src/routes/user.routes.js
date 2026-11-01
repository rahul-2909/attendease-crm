const express = require('express');
const {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
} = require('../controllers/user.controller');
const validate = require('../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../validations/user.validation');
const { protect } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(protect);

router.get('/me', requirePermission(PERMISSIONS.PROFILE_READ), getProfile);
router.patch('/me', requirePermission(PERMISSIONS.PROFILE_UPDATE), updateProfile);

router.post('/', requirePermission(PERMISSIONS.USER_CREATE), validate(createUserSchema), createUser);
router.get('/', requirePermission(PERMISSIONS.USER_READ), listUsers);
router.get('/:id', requirePermission(PERMISSIONS.USER_READ), getUser);
router.patch('/:id', requirePermission(PERMISSIONS.USER_UPDATE), validate(updateUserSchema), updateUser);
router.delete('/:id', requirePermission(PERMISSIONS.USER_DELETE), deleteUser);

module.exports = router;
