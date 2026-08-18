const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Project = require('../models/Project');
const Submission = require('../models/Submission');
const Review = require('../models/Review');

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/project_portal');
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany();
    await Project.deleteMany();
    await Submission.deleteMany();
    await Review.deleteMany();
    console.log('Database cleared.');

    const users = await User.create([
      {
        name: 'Admin Principal',
        email: 'admin@university.edu',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'Dr. Alan Turing',
        email: 'faculty1@university.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science'
      },
      {
        name: 'Dr. Ada Lovelace',
        email: 'faculty2@university.edu',
        password: 'password123',
        role: 'faculty',
        department: 'Mathematics'
      },
      {
        name: 'Alice Smith',
        email: 'student1@university.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science'
      },
      {
        name: 'Bob Jones',
        email: 'student2@university.edu',
        password: 'password123',
        role: 'student',
        department: 'Computer Science'
      },
      {
        name: 'Charlie Brown',
        email: 'student3@university.edu',
        password: 'password123',
        role: 'student',
        department: 'Mathematics'
      }
    ]);
    console.log('Users seeded.');

    const guideCS = users.find(u => u.email === 'faculty1@university.edu')._id;
    const guideMath = users.find(u => u.email === 'faculty2@university.edu')._id;
    const student1 = users.find(u => u.email === 'student1@university.edu')._id;
    const student2 = users.find(u => u.email === 'student2@university.edu')._id;
    const student3 = users.find(u => u.email === 'student3@university.edu')._id;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const lateDeadline = new Date();
    lateDeadline.setDate(lateDeadline.getDate() + 5);

    await Project.create([
      {
        title: 'AI Attendance System',
        description: 'Build a face recognition-based automated attendance tracker using Python OpenCV, Node.js, and React. Should support real-time camera feeds and department logs.',
        technologies: ['React', 'Node.js', 'Express', 'Python', 'OpenCV'],
        students: [student1, student2],
        guide: guideCS,
        status: 'pending',
        deadline: futureDate,
        allowLateSubmission: false
      },
      {
        title: 'Blockchain Ledger',
        description: 'Implement a distributed and immutable voting ledger utilizing Ethereum smart contracts and a clean web UI for transparency in student elections.',
        technologies: ['React', 'Solidity', 'Web3.js', 'Go'],
        students: [student3],
        guide: guideMath,
        status: 'pending',
        deadline: pastDate,
        allowLateSubmission: true,
        lateSubmissionDeadline: lateDeadline
      }
    ]);
    console.log('Projects seeded.');
    console.log('Seeder completed successfully.');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
