const { hasPermission, hasAnyPermission } = require('../constants/permissions');

const requirePermission = (...required) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Not authorized');
      error.statusCode = 401;
      return next(error);
    }

    const allowed = required.every((permission) =>
      hasPermission(req.user.role, permission)
    );

    if (!allowed) {
      const error = new Error('Forbidden: insufficient permissions');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

const requireAnyPermission = (...required) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Not authorized');
      error.statusCode = 401;
      return next(error);
    }

    if (!hasAnyPermission(req.user.role, required)) {
      const error = new Error('Forbidden: insufficient permissions');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
};
