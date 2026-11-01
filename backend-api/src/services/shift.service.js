const Shift = require('../models/Shift');
const Location = require('../models/Location');
const { organizationFilter, resolveOrganizationId } = require('../utils/scope');

const notFound = (label) => {
  const error = new Error(`${label} not found`);
  error.statusCode = 404;
  return error;
};

const requireOrganization = (user, requestedOrganizationId) => {
  const organizationId = resolveOrganizationId(user, requestedOrganizationId);
  if (!organizationId) {
    const error = new Error('organizationId is required');
    error.statusCode = 400;
    throw error;
  }
  return organizationId;
};

const listShifts = async (user, query = {}) =>
  Shift.find(organizationFilter(user, query.organizationId)).sort({ name: 1 }).lean();

const createShift = async (user, data) => {
  const organizationId = requireOrganization(user, data.organizationId);
  return Shift.create({ ...data, organizationId });
};

const updateShift = async (user, id, data) => {
  const shift = await Shift.findOneAndUpdate(
    { _id: id, ...organizationFilter(user) },
    data,
    { new: true, runValidators: true }
  );
  if (!shift) throw notFound('Shift');
  return shift;
};

const deleteShift = async (user, id) => {
  const shift = await Shift.findOneAndDelete({
    _id: id,
    ...organizationFilter(user),
  });
  if (!shift) throw notFound('Shift');
  return shift;
};

const listLocations = async (user, query = {}) =>
  Location.find(organizationFilter(user, query.organizationId))
    .sort({ name: 1 })
    .lean();

const createLocation = async (user, data) => {
  const organizationId = requireOrganization(user, data.organizationId);
  return Location.create({ ...data, organizationId });
};

const updateLocation = async (user, id, data) => {
  const location = await Location.findOneAndUpdate(
    { _id: id, ...organizationFilter(user) },
    data,
    { new: true, runValidators: true }
  );
  if (!location) throw notFound('Location');
  return location;
};

const deleteLocation = async (user, id) => {
  const location = await Location.findOneAndDelete({
    _id: id,
    ...organizationFilter(user),
  });
  if (!location) throw notFound('Location');
  return location;
};

module.exports = {
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};
