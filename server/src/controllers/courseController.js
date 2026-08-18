const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Faculty, Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const { courseName, courseCode, description, department, semester, academicYear } = req.body;

    if (!courseName || !courseCode || !department || !semester || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: courseName, courseCode, department, semester, academicYear'
      });
    }

    const codeExists = await Course.findOne({ courseCode });
    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: `Course code '${courseCode}' is already registered`
      });
    }

    const course = await Course.create({
      courseName,
      courseCode,
      description,
      department,
      semester,
      academicYear,
      facultyId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get courses list (filtered by role access)
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.students = req.user.id;
    } else if (req.user.role === 'faculty') {
      query.facultyId = req.user.id;
    }

    const courses = await Course.find(query)
      .populate('facultyId', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course details by ID
// @route   GET /api/courses/:id
// @access  Private
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('facultyId', 'name email department')
      .populate('students', 'name email department');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const isEnrolled = course.students.some(s => s.id === req.user.id);
    const isOwner = course.facultyId.id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isEnrolled && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this course workspace'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course details
// @route   PUT /api/courses/:id
// @access  Private (Owner Faculty, Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const isOwner = course.facultyId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const { courseName, courseCode, description, department, semester, academicYear } = req.body;
    const updates = {};
    if (courseName) updates.courseName = courseName;
    if (courseCode) updates.courseCode = courseCode;
    if (description !== undefined) updates.description = description;
    if (department) updates.department = department;
    if (semester) updates.semester = semester;
    if (academicYear) updates.academicYear = academicYear;

    course = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('facultyId', 'name email department');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Archive course
// @route   DELETE /api/courses/:id
// @access  Private (Owner Faculty, Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const isOwner = course.facultyId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join course using referenceKey
// @route   POST /api/courses/join
// @access  Private (Student)
exports.joinCourse = async (req, res, next) => {
  try {
    const { referenceKey } = req.body;
    if (!referenceKey) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a course reference key'
      });
    }

    const course = await Course.findOne({ referenceKey });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Invalid course reference key'
      });
    }

    const isEnrolled = course.students.some(studentId => studentId.toString() === req.user.id);
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    course.students.push(req.user.id);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled students in course
// @route   GET /api/courses/:id/students
// @access  Private (Owner Faculty, Admin)
exports.getCourseStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'name email department');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const isOwner = course.facultyId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view student registry for this course'
      });
    }

    res.status(200).json({
      success: true,
      count: course.students.length,
      data: course.students
    });
  } catch (error) {
    next(error);
  }
};
