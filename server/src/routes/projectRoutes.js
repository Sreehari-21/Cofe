const express = require('express');
const { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  getGuides,
  getStudents
} = require('../controllers/projectController');
const { submitProject } = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .post(protect, authorize('faculty', 'admin'), createProject)
  .get(protect, getProjects);

router.get('/guides', protect, getGuides);
router.get('/students', protect, getStudents);

router.post('/:id/submit', protect, authorize('student', 'admin'), upload.single('file'), submitProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('faculty', 'admin'), updateProject)
  .delete(protect, authorize('faculty', 'admin'), deleteProject);

module.exports = router;
