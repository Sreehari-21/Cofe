const User = require('../models/User');
const Project = require('../models/Project');
const Submission = require('../models/Submission');
const Course = require('../models/Course');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;

    user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin)
exports.getStatistics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalProjects,
      totalSubmissions,
      pendingReviews,
      approvedProjects,
      rejectedProjects
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Course.countDocuments(),
      Project.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ status: 'pending' }),
      Project.countDocuments({ status: 'approved' }),
      Project.countDocuments({ status: 'rejected' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalProjects,
        totalSubmissions,
        pendingReviews,
        approvedProjects,
        rejectedProjects
      }
    });
  } catch (error) {
    next(error);
  }
};
