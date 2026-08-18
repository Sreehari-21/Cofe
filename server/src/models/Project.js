const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Project must belong to a Course']
  },
  title: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a project description']
  },
  technologies: {
    type: [String],
    required: [true, 'Please specify technologies used']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a faculty guide']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  deadline: {
    type: Date,
    required: [true, 'Please specify a submission deadline']
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  lateSubmissionDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);
