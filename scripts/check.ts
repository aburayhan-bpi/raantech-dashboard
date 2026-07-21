import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config({ path: '.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const user = await User.findOne({ email: 'raantechbd@gmail.com' });
  console.log('User password exists:', !!user?.password);
  
  const isMatch1 = await bcrypt.compare('password123', user?.password || '');
  console.log('Matches password123:', isMatch1);
  
  const isMatch2 = await bcrypt.compare('wrongpass', user?.password || '');
  console.log('Matches wrongpass:', isMatch2);
  
  process.exit(0);
}
check().catch(console.error);
