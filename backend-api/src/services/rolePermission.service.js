const RolePermission = require('../models/RolePermission');
const { ROLE_VALUES, SUPER_ADMIN } = require('../constants/roles');
const {
  MODULES,
  ACTIONS,
  allTrue,
  defaultsForRole,
  normalizeMatrix,
} = require('../constants/modules');

const permissionError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getRolePermissions = async (role, organizationId) => {
  if (role === SUPER_ADMIN) return allTrue();
  if (!organizationId) return defaultsForRole(role);

  let document = await RolePermission.findOne({ organizationId, role });

  if (!document) {
    try {
      document = await RolePermission.create({
        organizationId,
        role,
        modules: defaultsForRole(role),
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      document = await RolePermission.findOne({ organizationId, role });
    }
  }

  return normalizeMatrix(role, document.modules);
};

const getAllRolePermissions = async (organizationId) => {
  const entries = await Promise.all(
    ROLE_VALUES.map(async (role) => [role, await getRolePermissions(role, organizationId)])
  );
  return Object.fromEntries(entries);
};

const ensureRolePermissions = async (organizationId) => {
  if (!organizationId) return;

  await Promise.all(
    ROLE_VALUES.map((role) =>
      RolePermission.findOneAndUpdate(
        { organizationId, role },
        { $setOnInsert: { modules: defaultsForRole(role) } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
};

const updatePermission = async ({ organizationId, role, module, action, value }) => {
  if (!organizationId) {
    throw permissionError('organizationId is required');
  }
  if (role === SUPER_ADMIN) {
    throw permissionError('Super admin permissions cannot be changed', 403);
  }
  if (!ROLE_VALUES.includes(role)) {
    throw permissionError('Invalid role');
  }
  if (!MODULES.includes(module)) {
    throw permissionError('Invalid module');
  }
  if (!ACTIONS.includes(action)) {
    throw permissionError('Invalid permission action');
  }

  let document = await RolePermission.findOne({ organizationId, role });
  if (!document) {
    document = await RolePermission.create({
      organizationId,
      role,
      modules: defaultsForRole(role),
    });
  }

  const matrix = normalizeMatrix(role, document.modules);
  const next = Boolean(value);

  if (
    role === 'COMPANY_OWNER' &&
    module === 'permissions' &&
    (action === 'view' || action === 'update') &&
    !next
  ) {
    throw permissionError('Owner must retain Role Permissions access', 403);
  }

  const current = matrix[module];
  current[action] = next;

  if (action === 'view' && !next) {
    current.create = false;
    current.update = false;
    current.delete = false;
  }

  if (action !== 'view' && next) {
    current.view = true;
  }

  document.modules = matrix;
  document.markModified('modules');
  await document.save();

  return matrix;
};

module.exports = {
  getRolePermissions,
  getAllRolePermissions,
  ensureRolePermissions,
  updatePermission,
};
