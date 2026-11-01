const projectService = require('../services/project.service');
const { success } = require('../utils/response');

const listProjects = async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.user, req.query);
    return success(res, projects, 'Projects retrieved');
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.user, req.params.id);
    return success(res, project, 'Project retrieved');
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user, req.body);
    return success(res, project, 'Project created', 201);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(
      req.user,
      req.params.id,
      req.body
    );
    return success(res, project, 'Project updated');
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await projectService.deleteProject(req.user, req.params.id);
    return success(res, project, 'Project deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
