const User = require('../models/User');
const env = require('../config/env');
const {
  SUPER_ADMIN,
  COMPANY_OWNER,
  HR_ADMIN,
  MANAGER,
  EMPLOYEE,
  ROLE_VALUES,
} = require('../constants/roles');
const { permissionsForRole } = require('../constants/permissions');
const { generatePassword, hashPassword } = require('../utils/password');
const { sendMail } = require('../utils/mailer');
const { accountCredentialsEmail } = require('../utils/emailTemplates');
const {
  isSuperAdmin,
  organizationFilter,
  resolveOrganizationId,
} = require('../utils/scope');

const ASSIGNABLE_ROLES = {
  [SUPER_ADMIN]: ROLE_VALUES,
  [COMPANY_OWNER]: [HR_ADMIN, MANAGER, EMPLOYEE],
  [HR_ADMIN]: [MANAGER, EMPLOYEE],
};

const notFound = () => {
  const error = new Error('User not found');
  error.statusCode = 404;
  return error;
};

const forbidden = (message = 'Forbidden: insufficient permissions') => {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
};

const assertCanAssignRole = (actor, role) => {
  if (isSuperAdmin(actor)) return;
  const allowed = ASSIGNABLE_ROLES[actor.role] || [];
  if (!allowed.includes(role)) {
    throw forbidden(`You cannot assign the ${role} role`);
  }
};

const userScope = (actor, query = {}) => {
  if (isSuperAdmin(actor)) {
    return organizationFilter(actor, query.organizationId);
  }
  return actor.organizationId
    ? { organizationId: actor.organizationId }
    : { _id: null };
};

const toResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  organizationId: user.organizationId,
  departmentId: user.departmentId,
  permissions: permissionsForRole(user.role),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createUser = async (actor, userData) => {
  const {
    name,
    email,
    phone,
    role = EMPLOYEE,
    isActive = true,
    departmentId,
    password: providedPassword,
  } = userData;

  const organizationId = resolveOrganizationId(actor, userData.organizationId);

  if (!isSuperAdmin(actor) && !organizationId) {
    const error = new Error('organizationId is required');
    error.statusCode = 400;
    throw error;
  }

  assertCanAssignRole(actor, role);

  const normalizedEmail = email.toLowerCase().trim();
  const password = providedPassword || generatePassword(8);

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    phone,
    role,
    isActive,
    organizationId,
    departmentId,
  });

  let emailSent = false;

  try {
    const emailContent = accountCredentialsEmail({
      name: user.name,
      email: user.email,
      password,
      loginUrl: env.CORS_ORIGIN,
    });

    await sendMail({
      to: user.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    emailSent = true;
  } catch (error) {
    console.error(
      `Failed to send account credentials email to ${user.email}: ${error.message}`
    );
  }

  return {
    ...toResponse(user),
    emailSent,
  };
};

const listUsers = async (actor, query = {}) => {
  const filter = userScope(actor, query);

  if (query.role) filter.role = query.role;
  if (query.departmentId) filter.departmentId = query.departmentId;
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === true || query.isActive === 'true';
  }
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { email: new RegExp(query.search, 'i') },
    ];
  }

  return User.find(filter).sort({ createdAt: -1 }).lean();
};

const getUser = async (actor, id) => {
  const user = await User.findOne({ ...userScope(actor), _id: id }).lean();
  if (!user) throw notFound();
  return user;
};

const updateUser = async (actor, id, data) => {
  const user = await User.findOne({ ...userScope(actor), _id: id }).select(
    '+password'
  );
  if (!user) throw notFound();

  if (user.role === SUPER_ADMIN && !isSuperAdmin(actor)) {
    throw forbidden('Only a super admin can modify a super admin');
  }

  if (
    user.role === COMPANY_OWNER &&
    !isSuperAdmin(actor) &&
    String(user._id) !== String(actor._id)
  ) {
    throw forbidden('Only the company owner or a super admin can modify this account');
  }

  if (data.role && data.role !== user.role) {
    assertCanAssignRole(actor, data.role);
  }

  const updates = { ...data };

  if (!isSuperAdmin(actor)) {
    delete updates.organizationId;
  }

  if (updates.password) {
    updates.password = await hashPassword(updates.password);
  }

  Object.assign(user, updates);
  await user.save();

  return toResponse(user);
};

const deleteUser = async (actor, id) => {
  const user = await User.findOne({ ...userScope(actor), _id: id });
  if (!user) throw notFound();

  if (user.role === SUPER_ADMIN && !isSuperAdmin(actor)) {
    throw forbidden('Only a super admin can deactivate a super admin');
  }

  if (
    user.role === COMPANY_OWNER &&
    !isSuperAdmin(actor) &&
    String(user._id) !== String(actor._id)
  ) {
    throw forbidden('Only the company owner or a super admin can deactivate this account');
  }

  user.isActive = false;
  await user.save();

  return toResponse(user);
};

const getProfile = async (actor) => {
  const user = await User.findById(actor._id).lean();
  if (!user) throw notFound();
  return toResponse(user);
};

const updateProfile = async (actor, data) => {
  const user = await User.findById(actor._id).select('+password');
  if (!user) throw notFound();

  if (data.name) user.name = data.name;
  if (data.phone) user.phone = data.phone;
  if (data.password) user.password = await hashPassword(data.password);

  await user.save();

  return toResponse(user);
};

module.exports = {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  assertCanAssignRole,
};
