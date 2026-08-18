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
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.get('/guides', protect, getGuides);
router.get('/students', protect, getStudents);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

// Submit route (mounts Multer upload middleware)
router.post('/:id/submit', protect, upload.single('file'), submitProject);

module.exports = router;
