import mongoose, { Schema, Document } from 'mongoose';

export interface IResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const ResetTokenSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  }
);

// TTL index to automatically delete expired reset tokens (15 mins)
ResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.ResetToken || mongoose.model<IResetToken>('ResetToken', ResetTokenSchema);
