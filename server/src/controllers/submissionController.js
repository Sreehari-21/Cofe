const path = require('path');
const fs = require('fs');
const Submission = require('../models/Submission');
const Project = require('../models/Project');
const Course = require('../models/Course');

const uploadDir = path.join(__dirname, '../../uploads');

const publicFileInfo = (fileInfo) => {
  if (!fileInfo) return fileInfo;
  return {
    filename: fileInfo.filename,
    originalName: fileInfo.originalName,
    size: fileInfo.size,
    mimetype: fileInfo.mimetype
  };
};

const publicSubmission = (doc) => {
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  o.fileInfo = publicFileInfo(o.fileInfo);
  return o;
};

const canAccessSubmission = (req, submission) => {
  const ownerId = submission.submittedBy._id
    ? submission.submittedBy._id.toString()
    : submission.submittedBy.toString();
  const guideId = submission.projectId.guide
    ? submission.projectId.guide.toString()
    : null;
  const isOwner = ownerId === req.user.id;
  const isGuide = guideId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  return isOwner || isGuide || isAdmin;
};

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

    const lastSubmission = await Submission.findOne({
      projectId,
      submittedBy: req.user.id
    }).sort({ submissionVersion: -1 });

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
      data: publicSubmission(submission)
    });
  } catch (error) {
    next(error);
  }
};

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
      .populate('projectId', 'title deadline allowLateSubmission maxMarks guide')
      .populate('submittedBy', 'name email department')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions.map(publicSubmission)
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('projectId', 'title description deadline guide maxMarks')
      .populate('submittedBy', 'name email department');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (!canAccessSubmission(req, submission)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission'
      });
    }

    res.status(200).json({
      success: true,
      data: publicSubmission(submission)
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadFile = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('projectId', 'guide')
      .populate('submittedBy', 'name');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (!canAccessSubmission(req, submission)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this file'
      });
    }

    const safeName = path.basename(submission.fileInfo.filename);
    const filePath = path.join(uploadDir, safeName);

    if (!filePath.startsWith(uploadDir) || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    const original = (submission.fileInfo.originalName || safeName).replace(/"/g, '');
    const inline = req.query.inline === '1' || req.query.inline === 'true';
    const type = submission.fileInfo.mimetype || 'application/octet-stream';

    res.setHeader('Content-Type', type);
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename="${original}"`
    );
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
};
