const express = require('express');
const { 
  createCourse, 
  getCourses, 
  getCourseById, 
  updateCourse, 
  deleteCourse, 
  joinCourse,
  leaveCourse,
  getCourseStudents 
} = require('../controllers/courseController');
const { createProject, getProjectsByCourse } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, authorize('faculty', 'admin'), createCourse)
  .get(protect, getCourses);

router.post('/join', protect, authorize('student'), joinCourse);
router.post('/:id/leave', protect, authorize('student'), leaveCourse);

router.route('/:id')
  .get(protect, getCourseById)
  .put(protect, authorize('faculty', 'admin'), updateCourse)
  .delete(protect, authorize('faculty', 'admin'), deleteCourse);

router.get('/:id/students', protect, authorize('faculty', 'admin'), getCourseStudents);

router.route('/:courseId/projects')
  .post(protect, authorize('faculty', 'admin'), createProject)
  .get(protect, getProjectsByCourse);

module.exports = router;
