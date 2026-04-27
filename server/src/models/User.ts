import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: 'admin' | 'member';
  skills: string[];
  refreshToken: string;
  otp: {
    code: string;
    expiresAt: Date;
  };
  notificationPrefs: {
    inApp: boolean;
    email: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    displayName: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    skills: [{ type: String }],
    refreshToken: {
      type: String,
      default: '',
    },
    otp: {
      code: { type: String, default: '' },
      expiresAt: { type: Date },
    },
    notificationPrefs: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.otp;
  return obj;
};

export default mongoose.model<IUser>('User', userSchema);
