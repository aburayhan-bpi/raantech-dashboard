import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if we support social login
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'STAFF'],
      default: 'STAFF',
    },
    permissions: [{ type: String }],
    profileImage: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
