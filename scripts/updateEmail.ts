import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config({ path: '.env' });

async function updateEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to DB');

    const result = await User.updateOne(
      { email: 'admin@raantech.com' },
      { email: 'raantechbd@gmail.com' }
    );

    console.log('Email updated successfully:', result.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateEmail();
