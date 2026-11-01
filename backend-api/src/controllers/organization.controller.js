const organizationService = require('../services/organization.service');
const { success } = require('../utils/response');

const listOrganizations = async (req, res, next) => {
  try {
    const organizations = await organizationService.listOrganizations(req.query);
    return success(res, organizations, 'Organizations retrieved');
  } catch (error) {
    next(error);
  }
};

const getOrganization = async (req, res, next) => {
  try {
    const organization = await organizationService.getOrganization(req.params.id);
    return success(res, organization, 'Organization retrieved');
  } catch (error) {
    next(error);
  }
};

const createOrganization = async (req, res, next) => {
  try {
    const organization = await organizationService.createOrganization(req.body);
    return success(res, organization, 'Organization created', 201);
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const organization = await organizationService.updateOrganization(
      req.params.id,
      req.body
    );
    return success(res, organization, 'Organization updated');
  } catch (error) {
    next(error);
  }
};

const deleteOrganization = async (req, res, next) => {
  try {
    const organization = await organizationService.deleteOrganization(req.params.id);
    return success(res, organization, 'Organization deactivated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
};
