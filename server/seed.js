import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import env from './config/env.js';
import User from './models/User.js';
import Group from './models/Group.js';
import ExchangeRequest from './models/ExchangeRequest.js';
import Notification from './models/Notification.js';
import Session from './models/Session.js';
import Rating from './models/Rating.js';
import LearningProgress from './models/LearningProgress.js';
import GroupMessage from './models/GroupMessage.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('MongoDB connected for seeding...');

    await User.deleteMany({});
    await Group.deleteMany({});
    await ExchangeRequest.deleteMany({});
    await Notification.deleteMany({});
    await Session.deleteMany({});
    await Rating.deleteMany({});
    await LearningProgress.deleteMany({});
    await GroupMessage.deleteMany({});

    console.log('Collections cleared.');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const usersData = [
      {
        name: 'Teju', email: 'teju@skillswap.com', password,
        skillsToTeach: [{ name: 'Python', level: 'advanced' }, { name: 'ML', level: 'advanced' }],
        skillsToLearn: [{ name: 'React', level: 'beginner' }, { name: 'AWS', level: 'intermediate' }]
      },
      {
        name: 'Rahul', email: 'rahul@skillswap.com', password,
        skillsToTeach: [{ name: 'React', level: 'advanced' }, { name: 'UI/UX', level: 'advanced' }],
        skillsToLearn: [{ name: 'Python', level: 'beginner' }, { name: 'SQL', level: 'intermediate' }]
      },
      {
        name: 'Priya', email: 'priya@skillswap.com', password,
        skillsToTeach: [{ name: 'Java', level: 'advanced' }, { name: 'DSA', level: 'advanced' }],
        skillsToLearn: [{ name: 'ML', level: 'beginner' }, { name: 'Cloud', level: 'intermediate' }]
      },
      {
        name: 'Arjun', email: 'arjun@skillswap.com', password,
        skillsToTeach: [{ name: 'AWS', level: 'advanced' }, { name: 'DevOps', level: 'advanced' }],
        skillsToLearn: [{ name: 'Python', level: 'beginner' }, { name: 'React', level: 'beginner' }]
      },
      {
        name: 'Sneha', email: 'sneha@skillswap.com', password,
        skillsToTeach: [{ name: 'Figma', level: 'advanced' }, { name: 'UI/UX', level: 'advanced' }],
        skillsToLearn: [{ name: 'Java', level: 'beginner' }, { name: 'DSA', level: 'beginner' }]
      },
      {
        name: 'Karthik', email: 'karthik@skillswap.com', password,
        skillsToTeach: [{ name: 'SQL', level: 'advanced' }, { name: 'MongoDB', level: 'advanced' }],
        skillsToLearn: [{ name: 'DevOps', level: 'beginner' }, { name: 'Cloud', level: 'beginner' }]
      },
      {
        name: 'Ananya', email: 'ananya@skillswap.com', password,
        skillsToTeach: [{ name: 'Photoshop', level: 'advanced' }, { name: 'Illustrator', level: 'advanced' }],
        skillsToLearn: [{ name: 'Figma', level: 'intermediate' }, { name: 'UI/UX', level: 'intermediate' }]
      },
      {
        name: 'Vikram', email: 'vikram@skillswap.com', password,
        skillsToTeach: [{ name: 'React', level: 'advanced' }, { name: 'Node.js', level: 'advanced' }],
        skillsToLearn: [{ name: 'ML', level: 'beginner' }, { name: 'AI', level: 'beginner' }]
      }
    ];

    const users = await User.insertMany(usersData.map(u => ({ ...u, password: u.password })));
    console.log(`${users.length} users created.`);

    const groupsData = [
      {
        name: 'React Enthusiasts',
        description: 'Learn React together',
        skill: 'React',
        creator: users[1]._id,
        members: [
          { user: users[1]._id, role: 'admin' },
          { user: users[0]._id, role: 'member' }
        ],
        roadmap: [
          { day: 1, title: 'Intro to React', description: 'Components and JSX', completed: false }
        ]
      },
      {
        name: 'Python for Beginners',
        description: 'Start learning Python from scratch',
        skill: 'Python',
        creator: users[0]._id,
        members: [
          { user: users[0]._id, role: 'admin' },
          { user: users[1]._id, role: 'member' },
          { user: users[3]._id, role: 'member' }
        ],
        roadmap: [
          { day: 1, title: 'Basics', description: 'Variables and Loops', completed: false }
        ]
      },
      {
        name: 'AWS Cloud Masters',
        description: 'Master AWS and DevOps',
        skill: 'AWS',
        creator: users[3]._id,
        members: [
          { user: users[3]._id, role: 'admin' },
          { user: users[0]._id, role: 'member' }
        ],
        roadmap: []
      }
    ];

    await Group.insertMany(groupsData);
    console.log(`${groupsData.length} groups created.`);

    const exchangeData = [
      {
        from: users[0]._id,
        to: users[1]._id,
        skillToLearn: 'React',
        skillToTeach: 'Python',
        message: 'Hi Rahul, I can teach you Python if you help me with React!',
        status: 'pending'
      }
    ];

    await ExchangeRequest.insertMany(exchangeData);
    console.log('Exchange requests created.');

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
