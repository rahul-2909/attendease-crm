const { SUPER_ADMIN } = require('../constants/roles');
const { can } = require('../constants/modules');
const rolePermissionService = require('../services/rolePermission.service');

const ACTION_BY_METHOD = {
  GET: 'view',
  HEAD: 'view',
  OPTIONS: 'view',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

const requireModuleAccess = (moduleName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error('Not authorized');
        error.statusCode = 401;
        return next(error);
      }

      if (req.user.role === SUPER_ADMIN) return next();

      const action = ACTION_BY_METHOD[req.method] || 'view';
      const matrix = await rolePermissionService.getRolePermissions(
        req.user.role,
        req.user.organizationId
      );

      const allowed =
        can(matrix, moduleName, 'view') &&
        (action === 'view' || can(matrix, moduleName, action));

      if (!allowed) {
        const error = new Error('Forbidden: insufficient permissions');
        error.statusCode = 403;
        return next(error);
      }

      req.modulePermissions = matrix;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = { requireModuleAccess };
