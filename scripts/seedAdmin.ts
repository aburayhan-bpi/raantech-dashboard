import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config({ path: '.env' });

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to DB');

    const existing = await User.findOne({ email: 'admin@raantech.com' });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await User.create({
      name: 'Super Admin',
      email: 'admin@raantech.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    });

    console.log('Super Admin created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedAdmin();
