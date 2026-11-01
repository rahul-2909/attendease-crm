const express = require('express');
const {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} = require('../controllers/organization.controller');
const organizationService = require('../services/organization.service');
const validate = require('../middlewares/validate.middleware');
const {
  createOrganizationSchema,
  updateOrganizationSchema,
} = require('../validations/organization.validation');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { requirePermission } = require('../middlewares/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');
const { SUPER_ADMIN, COMPANY_OWNER } = require('../constants/roles');
const { resolveOrganizationId } = require('../utils/scope');
const { success } = require('../utils/response');

const router = express.Router();

router.use(protect);

router.get('/me', requirePermission(PERMISSIONS.ORGANIZATION_READ), async (req, res, next) => {
  try {
    const organizationId = resolveOrganizationId(req.user, req.query.organizationId);
    if (!organizationId) {
      const error = new Error('organizationId is required');
      error.statusCode = 400;
      return next(error);
    }
    const organization = await organizationService.getOrganization(organizationId);
    return success(res, organization, 'Organization retrieved');
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/me',
  requirePermission(PERMISSIONS.ORGANIZATION_UPDATE),
  validate(updateOrganizationSchema),
  async (req, res, next) => {
    try {
      const organizationId = resolveOrganizationId(req.user, req.query.organizationId);
      if (!organizationId) {
        const error = new Error('organizationId is required');
        error.statusCode = 400;
        return next(error);
      }
      const organization = await organizationService.updateOrganization(
        organizationId,
        req.body
      );
      return success(res, organization, 'Organization updated');
    } catch (error) {
      next(error);
    }
  }
);

router.use(authorize(SUPER_ADMIN, COMPANY_OWNER));

router.get('/', listOrganizations);
router.post('/', validate(createOrganizationSchema), createOrganization);
router.get('/:id', getOrganization);
router.patch('/:id', validate(updateOrganizationSchema), updateOrganization);
router.delete('/:id', deleteOrganization);

module.exports = router;
