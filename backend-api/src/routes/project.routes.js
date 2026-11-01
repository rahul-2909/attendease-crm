const express = require('express');
const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/project.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createProjectSchema,
  updateProjectSchema,
} = require('../validations/project.validation');
const { protect } = require('../middlewares/auth.middleware');
const { requireModuleAccess } = require('../middlewares/moduleAccess.middleware');

const router = express.Router();

router.use(protect);
router.use(requireModuleAccess('projects'));

router.get('/', listProjects);
router.post('/', validate(createProjectSchema), createProject);
router.get('/:id', getProject);
router.patch('/:id', validate(updateProjectSchema), updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
