const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileInfo: {
    path: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String },
    size: { type: Number },
    mimetype: { type: String }
  },
  submissionVersion: {
    type: Number,
    default: 1
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed'],
    default: 'pending'
  },
  facultyFeedback: {
    type: String
  },
  marks: {
    type: Number
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
