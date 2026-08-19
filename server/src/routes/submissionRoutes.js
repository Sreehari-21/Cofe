const express = require('express');
const { getSubmissions, getSubmissionById, downloadFile, deleteSubmission } = require('../controllers/submissionController');
const { createReview, getReviewsBySubmission } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getSubmissions);
router.get('/:id/file', protect, downloadFile);
router.delete('/:id', protect, deleteSubmission);
router.get('/:id', protect, getSubmissionById);

// Reviews routes nested under submission context
router.post('/:id/review', protect, authorize('faculty', 'admin'), createReview);
router.get('/:id/reviews', protect, getReviewsBySubmission);

module.exports = router;
