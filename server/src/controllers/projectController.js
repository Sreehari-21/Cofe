const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Student, Faculty, Admin)
exports.createProject = async (req, res, next) => {
  try {
    let { title, description, technologies, students, guide, deadline, allowLateSubmission, lateSubmissionDeadline } = req.body;

    if (!title || !description || !technologies || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: title, description, technologies, deadline'
      });
    }

    if (typeof technologies === 'string') {
      technologies = technologies.split(',').map(tech => tech.trim());
    }

    if (req.user.role === 'student') {
      students = [req.user.id];
      if (!guide) {
        return res.status(400).json({
          success: false,
          message: 'Please select a faculty guide'
        });
      }
    } else {
      if (!students || !Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one student team member'
        });
      }
      if (!guide) {
        return res.status(400).json({
          success: false,
          message: 'Please select a faculty guide'
        });
      }
    }

    const facultyUser = await User.findById(guide);
    if (!facultyUser || facultyUser.role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Assigned guide must be a valid faculty member'
      });
    }

    for (const studentId of students) {
      const studentUser = await User.findById(studentId);
      if (!studentUser || studentUser.role !== 'student') {
        return res.status(400).json({
          success: false,
          message: `User with ID ${studentId} is not a valid student`
        });
      }
    }

    const project = await Project.create({
      title,
      description,
      technologies,
      students,
      guide,
      deadline,
      allowLateSubmission: allowLateSubmission || false,
      lateSubmissionDeadline
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects (filtered by role)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.students = req.user.id;
    } else if (req.user.role === 'faculty') {
      query.guide = req.user.id;
    }

    const projects = await Project.find(query)
      .populate('students', 'name email department')
      .populate('guide', 'name email department');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('students', 'name email department')
      .populate('guide', 'name email department');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isStudent = project.students.some(student => student.id === req.user.id);
    const isGuide = project.guide.id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isGuide && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isStudent = project.students.some(studentId => studentId.toString() === req.user.id);
    const isGuide = project.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isGuide && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    let updates = {};

    if (req.user.role === 'student') {
      const { title, description, technologies } = req.body;
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (technologies) {
        updates.technologies = typeof technologies === 'string' 
          ? technologies.split(',').map(tech => tech.trim()) 
          : technologies;
      }
    } else {
      const { title, description, technologies, students, guide, status, deadline, allowLateSubmission, lateSubmissionDeadline } = req.body;
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (status) updates.status = status;
      if (deadline) updates.deadline = deadline;
      if (allowLateSubmission !== undefined) updates.allowLateSubmission = allowLateSubmission;
      if (lateSubmissionDeadline !== undefined) updates.lateSubmissionDeadline = lateSubmissionDeadline;
      
      if (technologies) {
        updates.technologies = typeof technologies === 'string' 
          ? technologies.split(',').map(tech => tech.trim()) 
          : technologies;
      }

      if (guide) {
        const facultyUser = await User.findById(guide);
        if (!facultyUser || facultyUser.role !== 'faculty') {
          return res.status(400).json({
            success: false,
            message: 'Assigned guide must be a valid faculty member'
          });
        }
        updates.guide = guide;
      }

      if (students) {
        if (!Array.isArray(students) || students.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Please provide at least one student team member'
          });
        }
        for (const studentId of students) {
          const studentUser = await User.findById(studentId);
          if (!studentUser || studentUser.role !== 'student') {
            return res.status(400).json({
              success: false,
              message: `User with ID ${studentId} is not a valid student`
            });
          }
        }
        updates.students = students;
      }
    }

    project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('students', 'name email department').populate('guide', 'name email department');

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isGuide = project.guide.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isGuide && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all faculty members for guide selection
// @route   GET /api/projects/guides
// @access  Private
exports.getGuides = async (req, res, next) => {
  try {
    const guides = await User.find({ role: 'faculty' }).select('name email department');
    res.status(200).json({
      success: true,
      data: guides
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student members for project assignment
// @route   GET /api/projects/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email department');
    res.status(200).json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};
