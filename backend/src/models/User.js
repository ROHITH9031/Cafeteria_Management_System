import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    studentId: { type: String, trim: true, maxlength: 40 },
    contactInfo: { type: String, trim: true, maxlength: 30 },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
