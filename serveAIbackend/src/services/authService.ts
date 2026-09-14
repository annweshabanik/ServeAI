import { Role, User } from '@prisma/client';
import { prisma } from '../config/db';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/appError';


export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    role?: Role;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    user: Omit<User, 'passwordHash'>;
    token: string;
}


const sanitizeUser = (user: User): Omit<User, 'passwordHash'> => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};
export const registerUser = async (data: RegisterInput): Promise<AuthResult> => {
  const { name, email, password, role } = data;
  if (!email || !password || !name) {
    throw new AppError('Name, email, and password are required.', 400);
  }
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email is already registered.', 400);
  }
  const hashedPassword = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: role || Role.WAITER,
    },
  });
  const token = signToken({ userId: newUser.id, role: newUser.role });
  return {
    user: sanitizeUser(newUser),
    token,
  };
};
export const loginUser = async (data: LoginInput): Promise<AuthResult> => {
  const { email, password } = data;
  if (!email || !password) {
    throw new AppError('Please provide email and password.', 400);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }
  const token = signToken({ userId: user.id, role: user.role });
  return {
    user: sanitizeUser(user),
    token,
  };
};
export const getUserProfile = async (userId: string): Promise<Omit<User, 'passwordHash'>> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return sanitizeUser(user);
};