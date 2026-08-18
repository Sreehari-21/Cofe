const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: {
    type: String,
    required: [true, 'Please add review comments']
  },
  marks: {
    type: Number,
    required: [true, 'Please assign marks']
  },
  decision: {
    type: String,
    enum: ['approved', 'rejected'],
    required: [true, 'Please provide a decision (approved/rejected)']
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
