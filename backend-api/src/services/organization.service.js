const Organization = require('../models/Organization');

const notFound = () => {
  const error = new Error('Organization not found');
  error.statusCode = 404;
  return error;
};

const listOrganizations = async (query = {}) => {
  const filter = {};
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === true || query.isActive === 'true';
  }
  if (query.search) {
    filter.name = new RegExp(query.search, 'i');
  }
  return Organization.find(filter).sort({ createdAt: -1 }).lean();
};

const getOrganization = async (id) => {
  const organization = await Organization.findById(id).lean();
  if (!organization) throw notFound();
  return organization;
};

const createOrganization = async (data) => {
  return Organization.create(data);
};

const updateOrganization = async (id, data) => {
  const organization = await Organization.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!organization) throw notFound();
  return organization;
};

const deleteOrganization = async (id) => {
  const organization = await Organization.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!organization) throw notFound();
  return organization;
};

module.exports = {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
};
