const express = require('express');
const { attendanceReport, leaveReport } = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');
const { requireAnyPermission } = require('../middlewares/permission.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('reports'));

const reportPermissions = [
  PERMISSIONS.REPORT_READ_TEAM,
  PERMISSIONS.REPORT_READ_ORG,
  PERMISSIONS.REPORT_READ_PLATFORM,
];

router.get('/attendance', requireAnyPermission(...reportPermissions), attendanceReport);
router.get('/leave', requireAnyPermission(...reportPermissions), leaveReport);

module.exports = router;
