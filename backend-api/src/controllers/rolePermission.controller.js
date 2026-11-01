const rolePermissionService = require('../services/rolePermission.service');
const { resolveScopedOrganizationId } = require('../utils/scope');
const { success } = require('../utils/response');

const resolveOrgId = async (req) => {
  const organizationId = await resolveScopedOrganizationId(
    req.user,
    req.query.organizationId || req.body.organizationId
  );
  if (!organizationId) {
    const error = new Error('organizationId is required');
    error.statusCode = 400;
    throw error;
  }
  return organizationId;
};

const listPermissions = async (req, res, next) => {
  try {
    const organizationId = await resolveOrgId(req);
    const permissions = await rolePermissionService.getAllRolePermissions(
      organizationId
    );
    return success(res, permissions, 'Role permissions retrieved');
  } catch (error) {
    next(error);
  }
};

const getPermissions = async (req, res, next) => {
  try {
    const organizationId = await resolveOrgId(req);
    const permissions = await rolePermissionService.getRolePermissions(
      req.params.role,
      organizationId
    );
    return success(res, permissions, 'Role permissions retrieved');
  } catch (error) {
    next(error);
  }
};

const updatePermission = async (req, res, next) => {
  try {
    const organizationId = await resolveOrgId(req);
    const permissions = await rolePermissionService.updatePermission({
      organizationId,
      role: req.params.role,
      module: req.body.module,
      action: req.body.action,
      value: req.body.value,
    });
    return success(res, permissions, 'Permission updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPermissions,
  getPermissions,
  updatePermission,
};
