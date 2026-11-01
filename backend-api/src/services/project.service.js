const Project = require('../models/Project');
const Employee = require('../models/Employee');
const { organizationFilter, resolveOrganizationId } = require('../utils/scope');

const notFound = () => {
  const error = new Error('Project not found');
  error.statusCode = 404;
  return error;
};

const populateProject = (query) =>
  query.populate({
    path: 'team',
    select: 'name designation employeeCode initials color departmentId isActive',
    populate: { path: 'departmentId', select: 'name' },
  });

const listProjects = async (user, query = {}) => {
  const filter = organizationFilter(user, query.organizationId);

  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { code: new RegExp(query.search, 'i') },
      { client: new RegExp(query.search, 'i') },
    ];
  }

  const projects = await populateProject(Project.find(filter)).sort({ createdAt: -1 }).lean();
  return projects;
};

const getProject = async (user, id) => {
  const project = await populateProject(
    Project.findOne({ _id: id, ...organizationFilter(user) })
  ).lean();
  if (!project) throw notFound();
  return project;
};

const assertTeam = async (organizationId, team = []) => {
  if (!team.length) return team;
  const employees = await Employee.find({
    _id: { $in: team },
    organizationId,
  })
    .select('_id')
    .lean();

  if (employees.length !== team.length) {
    const error = new Error('One or more team members are invalid');
    error.statusCode = 400;
    throw error;
  }

  return employees.map((employee) => employee._id);
};

const createProject = async (user, data) => {
  const organizationId = resolveOrganizationId(user, data.organizationId);
  if (!organizationId) {
    const error = new Error('organizationId is required');
    error.statusCode = 400;
    throw error;
  }

  const team = await assertTeam(organizationId, data.team || []);
  return Project.create({ ...data, team, organizationId });
};

const updateProject = async (user, id, data) => {
  const project = await Project.findOne({ _id: id, ...organizationFilter(user) });
  if (!project) throw notFound();

  const updates = { ...data };

  if (updates.team) {
    updates.team = await assertTeam(project.organizationId, updates.team);
  }

  Object.assign(project, updates);
  await project.save();
  return getProject(user, id);
};

const deleteProject = async (user, id) => {
  const project = await Project.findOneAndDelete({
    _id: id,
    ...organizationFilter(user),
  });
  if (!project) throw notFound();
  await Employee.updateMany({ projectId: project._id }, { $unset: { projectId: 1 } });
  return project;
};

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
