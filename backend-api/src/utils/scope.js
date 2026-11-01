const roles = require('../constants/roles');

const isSuperAdmin = (user) => user.role === roles.SUPER_ADMIN;

const isOrgWide = (user) =>
  [roles.SUPER_ADMIN, roles.COMPANY_OWNER, roles.HR_ADMIN].includes(user.role);

const isManager = (user) => user.role === roles.MANAGER;

const resolveOrganizationId = (user, requestedOrganizationId) => {
  if (isSuperAdmin(user)) {
    return requestedOrganizationId || user.organizationId || null;
  }
  return user.organizationId;
};

const resolveScopedOrganizationId = async (user, requestedOrganizationId) => {
  const organizationId = resolveOrganizationId(user, requestedOrganizationId);
  if (organizationId) return organizationId;
  if (!isSuperAdmin(user)) return null;

  const Organization = require('../models/Organization');
  const organization = await Organization.findOne()
    .sort({ createdAt: 1 })
    .select('_id')
    .lean();
  return organization?._id || null;
};

const organizationFilter = (user, requestedOrganizationId) => {
  const organizationId = resolveOrganizationId(user, requestedOrganizationId);
  return organizationId ? { organizationId } : {};
};

const assertOrganizationAccess = (user, organizationId) => {
  if (isSuperAdmin(user)) return;
  if (!user.organizationId || String(user.organizationId) !== String(organizationId)) {
    const error = new Error('Forbidden: organization access denied');
    error.statusCode = 403;
    throw error;
  }
};

module.exports = {
  isSuperAdmin,
  isOrgWide,
  isManager,
  resolveOrganizationId,
  resolveScopedOrganizationId,
  organizationFilter,
  assertOrganizationAccess,
};
