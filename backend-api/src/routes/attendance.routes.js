const express = require('express');
const {
  getOverview,
  listAttendance,
  getMyAttendance,
  checkIn,
  checkOut,
  markAttendance,
  updateAttendance,
} = require('../controllers/attendance.controller');
const validate = require('../middlewares/validate.middleware');
const {
  markAttendanceSchema,
  updateAttendanceSchema,
} = require('../validations/attendance.validation');
const { protect } = require('../middlewares/auth.middleware');
const {
  requirePermission,
  requireAnyPermission,
} = require('../middlewares/permission.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('attendance'));

router.get(
  '/overview',
  requireAnyPermission(
    PERMISSIONS.ATTENDANCE_READ_SELF,
    PERMISSIONS.ATTENDANCE_READ_TEAM,
    PERMISSIONS.ATTENDANCE_READ_ORG
  ),
  getOverview
);
router.get('/me', requirePermission(PERMISSIONS.ATTENDANCE_READ_SELF), getMyAttendance);
router.post('/check-in', requirePermission(PERMISSIONS.ATTENDANCE_CHECK_IN), checkIn);
router.post('/check-out', requirePermission(PERMISSIONS.ATTENDANCE_CHECK_OUT), checkOut);

router.get(
  '/',
  requireAnyPermission(
    PERMISSIONS.ATTENDANCE_READ_TEAM,
    PERMISSIONS.ATTENDANCE_READ_ORG
  ),
  listAttendance
);
router.post(
  '/',
  requirePermission(PERMISSIONS.ATTENDANCE_MANAGE),
  validate(markAttendanceSchema),
  markAttendance
);
router.patch(
  '/:id',
  requirePermission(PERMISSIONS.ATTENDANCE_MANAGE),
  validate(updateAttendanceSchema),
  updateAttendance
);

module.exports = router;
