import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  userId: mongoose.Types.ObjectId;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const OtpSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  }
);

// TTL index to automatically delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
