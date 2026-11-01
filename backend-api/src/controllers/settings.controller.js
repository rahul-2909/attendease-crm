const settingsService = require('../services/settings.service');
const { success } = require('../utils/response');

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings(req.user, req.query);
    return success(res, settings, 'Settings retrieved');
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.user, req.body);
    return success(res, settings, 'Settings updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings };
