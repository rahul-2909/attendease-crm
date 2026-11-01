const Settings = require('../models/Settings');
const Organization = require('../models/Organization');
const Employee = require('../models/Employee');
const { resolveScopedOrganizationId } = require('../utils/scope');

const resolveOrgId = async (user, requested) => {
  const organizationId = await resolveScopedOrganizationId(user, requested);
  if (!organizationId) {
    const error = new Error('organizationId is required');
    error.statusCode = 400;
    throw error;
  }
  return organizationId;
};

const getOrCreateSettings = async (organizationId) => {
  let settings = await Settings.findOne({ organizationId });
  if (settings) return settings;

  const organization = await Organization.findById(organizationId).lean();
  settings = await Settings.create({
    organizationId,
    companyName: organization?.name || 'My Company',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
  });
  return settings;
};

const toResponse = async (settings) => {
  const employeeCount = await Employee.countDocuments({
    organizationId: settings.organizationId,
    isActive: true,
  });

  return {
    ...settings.toObject(),
    employeeCount,
    employeeLimit: settings.employeeLimit,
  };
};

const getSettings = async (user, query = {}) => {
  const organizationId = await resolveOrgId(user, query.organizationId);
  const settings = await getOrCreateSettings(organizationId);
  return toResponse(settings);
};

const updateSettings = async (user, data) => {
  const organizationId = await resolveOrgId(user, data.organizationId);
  const settings = await getOrCreateSettings(organizationId);

  const allowed = [
    'companyName',
    'companyEmail',
    'companyPhone',
    'companyAddress',
    'graceMinutes',
    'gpsEnabled',
    'qrEnabled',
    'manualEnabled',
    'lateAlertsEnabled',
    'leaveEnabled',
    'checkoutReminderEnabled',
    'plan',
    'employeeLimit',
    'renewalDate',
  ];

  allowed.forEach((field) => {
    if (data[field] !== undefined) settings[field] = data[field];
  });

  await settings.save();
  return toResponse(settings);
};

module.exports = {
  getSettings,
  updateSettings,
};
