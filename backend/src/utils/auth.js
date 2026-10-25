import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function createToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId, contactInfo: user.contactInfo };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
