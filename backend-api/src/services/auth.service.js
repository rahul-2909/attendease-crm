const User = require('../models/User');
const Organization = require('../models/Organization');
const Settings = require('../models/Settings');
const { comparePassword, hashPassword } = require('../utils/password');
const { generateAccessToken } = require('../utils/generateToken');
const { permissionsForRole } = require('../constants/permissions');
const { SUPER_ADMIN, COMPANY_OWNER } = require('../constants/roles');
const rolePermissionService = require('./rolePermission.service');

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'workspace';

const uniqueSlug = async (base) => {
  let slug = base;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Organization.exists({ slug })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

const login = async (email, password) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (user.isActive === false) {
    const err = new Error('Account is deactivated');
    err.statusCode = 401;
    throw err;
  }

  if (!user.password) {
    const err = new Error('Account is not set up. Please contact an administrator.');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const payload = {
    id: user._id,
    role: user.role,
    organizationId: user.organizationId,
  };

  const accessToken = generateAccessToken(payload);

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    departmentId: user.departmentId,
    permissions: permissionsForRole(user.role),
    modulePermissions: await rolePermissionService.getRolePermissions(
      user.role,
      user.organizationId
    ),
  };

  return {
    accessToken,
    user: userResponse,
  };
};

const register = async (data) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const companyName = (data.companyName || `${data.name}'s workspace`).trim();
  const organization = await Organization.create({
    name: companyName,
    slug: await uniqueSlug(slugify(companyName)),
  });

  const hashedPassword = await hashPassword(data.password);

  await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    phone: data.phone.trim(),
    password: hashedPassword,
    role: COMPANY_OWNER,
    organizationId: organization._id,
    isActive: true,
  });

  await Settings.create({
    organizationId: organization._id,
    companyName,
  });

  await rolePermissionService.ensureRolePermissions(organization._id);

  return login(normalizedEmail, data.password);
};

const bootstrapSuperAdmin = async (data) => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    const err = new Error('Bootstrap already completed');
    err.statusCode = 403;
    throw err;
  }

  const normalizedEmail = data.email.toLowerCase().trim();
  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    phone: data.phone,
    password: hashedPassword,
    role: SUPER_ADMIN,
    isActive: true,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: permissionsForRole(user.role),
    modulePermissions: await rolePermissionService.getRolePermissions(
      user.role,
      user.organizationId
    ),
  };
};

module.exports = {
  login,
  register,
  bootstrapSuperAdmin,
};
