const Review = require('../models/Review');
const Submission = require('../models/Submission');
const Project = require('../models/Project');

// @desc    Review a submission
// @route   POST /api/submissions/:id/review
// @access  Private (Faculty, Admin)
exports.createReview = async (req, res, next) => {
  try {
    const submissionId = req.params.id;
    const { comments, marks, decision } = req.body;

    if (!comments || marks === undefined || !decision) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: comments, marks, decision'
      });
    }

    const numericMarks = Number(marks);
    if (Number.isNaN(numericMarks) || numericMarks < 0) {
      return res.status(400).json({
        success: false,
        message: 'Marks must be a non-negative number'
      });
    }

    const submission = await Submission.findById(submissionId).populate('projectId');
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const project = submission.projectId;
    const isGuide = project.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isGuide && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this submission'
      });
    }

    const cap = project.maxMarks || 100;
    if (numericMarks > cap) {
      return res.status(400).json({
        success: false,
        message: `Marks cannot exceed maximum of ${cap}`
      });
    }

    const review = await Review.create({
      submissionId,
      reviewer: req.user.id,
      comments,
      marks: numericMarks,
      decision
    });

    submission.status = 'reviewed';
    submission.facultyFeedback = comments;
    submission.marks = numericMarks;
    await submission.save();

    project.status = decision;
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a submission
// @route   GET /api/submissions/:id/reviews
// @access  Private
exports.getReviewsBySubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('projectId');
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const isOwner = submission.submittedBy.toString() === req.user.id;
    const isGuide = submission.projectId.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isGuide && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these reviews'
      });
    }

    const reviews = await Review.find({ submissionId: req.params.id })
      .populate('reviewer', 'name email department')
      .sort({ reviewedAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
