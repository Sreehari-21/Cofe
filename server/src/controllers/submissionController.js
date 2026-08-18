const Submission = require('../models/Submission');
const Project = require('../models/Project');
const Course = require('../models/Course');

// @desc    Submit project file
// @route   POST /api/projects/:id/submit
// @access  Private (Student)
exports.submitProject = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const course = await Course.findById(project.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Parent Course not found'
      });
    }

    const isEnrolled = course.students.some(studentId => studentId.toString() === req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isEnrolled && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit deliverables for this course assignment'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a project document'
      });
    }

    const now = new Date();
    if (now > project.deadline) {
      if (!project.allowLateSubmission) {
        return res.status(400).json({
          success: false,
          message: 'Submission closed: deadline has passed'
        });
      }
      
      if (project.lateSubmissionDeadline && now > project.lateSubmissionDeadline) {
        return res.status(400).json({
          success: false,
          message: 'Submission closed: late submission deadline has also passed'
        });
      }
    }

    const lastSubmission = await Submission.findOne({ projectId })
      .sort({ submissionVersion: -1 });
    
    const version = lastSubmission ? lastSubmission.submissionVersion + 1 : 1;

    const submission = await Submission.create({
      projectId,
      submittedBy: req.user.id,
      fileInfo: {
        path: req.file.path,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      submissionVersion: version,
      submittedAt: now
    });

    res.status(201).json({
      success: true,
      message: 'Project submitted successfully',
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions list (filtered by role)
// @route   GET /api/submissions
// @access  Private
exports.getSubmissions = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.submittedBy = req.user.id;
    } else if (req.user.role === 'faculty') {
      const projects = await Project.find({ guide: req.user.id }).distinct('_id');
      query.projectId = { $in: projects };
    }

    const submissions = await Submission.find(query)
      .populate('projectId', 'title deadline allowLateSubmission')
      .populate('submittedBy', 'name email department')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('projectId', 'title description deadline guide')
      .populate('submittedBy', 'name email department');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const isOwner = submission.submittedBy.id === req.user.id;
    const isGuide = submission.projectId.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isGuide && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};
