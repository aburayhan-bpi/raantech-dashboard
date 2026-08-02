import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE';
  isDeleted: boolean;
  deletedAt: Date | null;
  profileImage?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const VALID_PERMISSIONS = [
  "sales:view", "sales:create", "sales:update", "sales:delete", "sales:refund", "sales:return",
  "purchases:view", "purchases:create", "purchases:update", "purchases:delete", "purchases:return",
  "products:view", "products:create", "products:update", "products:delete",
  "categories:view", "categories:create", "categories:update", "categories:delete",
  "suppliers:view", "suppliers:create", "suppliers:update", "suppliers:delete",
  "customers:view", "customers:create", "customers:update", "customers:delete",
  "expenses:view", "expenses:create", "expenses:update", "expenses:delete"
];

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
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    permissions: [{ type: String, enum: VALID_PERMISSIONS }],
    profileImage: { type: String },
    address: { type: String },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
