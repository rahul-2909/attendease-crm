const express = require('express');
const {
  applyLeave,
  listLeaves,
  getLeave,
  reviewLeave,
  cancelLeave,
  deleteLeave,
} = require('../controllers/leave.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createLeaveSchema,
  reviewLeaveSchema,
} = require('../validations/leave.validation');
const { protect } = require('../middlewares/auth.middleware');
const {
  requirePermission,
  requireAnyPermission,
} = require('../middlewares/permission.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('leave'));

router.post('/', requirePermission(PERMISSIONS.LEAVE_APPLY), validate(createLeaveSchema), applyLeave);
router.get(
  '/',
  requireAnyPermission(
    PERMISSIONS.LEAVE_READ_SELF,
    PERMISSIONS.LEAVE_READ_TEAM,
    PERMISSIONS.LEAVE_READ_ORG
  ),
  listLeaves
);
router.get(
  '/:id',
  requireAnyPermission(
    PERMISSIONS.LEAVE_READ_SELF,
    PERMISSIONS.LEAVE_READ_TEAM,
    PERMISSIONS.LEAVE_READ_ORG
  ),
  getLeave
);
router.patch(
  '/:id/review',
  requireAnyPermission(
    PERMISSIONS.LEAVE_APPROVE_TEAM,
    PERMISSIONS.LEAVE_APPROVE_ORG
  ),
  validate(reviewLeaveSchema),
  reviewLeave
);
router.patch('/:id/cancel', requirePermission(PERMISSIONS.LEAVE_APPLY), cancelLeave);
router.delete('/:id', deleteLeave);

module.exports = router;
