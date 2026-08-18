const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Please add a course name'],
    trim: true
  },
  courseCode: {
    type: String,
    required: [true, 'Please add a course code'],
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  department: {
    type: String,
    required: [true, 'Please specify a department']
  },
  semester: {
    type: String,
    required: [true, 'Please specify a semester']
  },
  academicYear: {
    type: String,
    required: [true, 'Please specify academic year']
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referenceKey: {
    type: String,
    unique: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Auto-generate reference key before saving if not already set
CourseSchema.pre('save', async function(next) {
  if (!this.referenceKey) {
    const initials = this.courseName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 3)
      .toUpperCase();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let r1 = '';
    let r2 = '';
    for (let i = 0; i < 4; i++) r1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 2; i++) r2 += chars.charAt(Math.floor(Math.random() * chars.length));
    this.referenceKey = `${initials}-${r1}-${r2}`;
  }
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
