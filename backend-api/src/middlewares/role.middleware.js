const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Not authorized');
      error.statusCode = 401;
      return next(error);
    }
    if (!roles.includes(req.user.role)) {
      const error = new Error('Forbidden: insufficient permissions');
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};

module.exports = { authorize };
