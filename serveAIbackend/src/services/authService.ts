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
  email?: string;
  loginId?: string;
  identifier?: string;
  password: string;
}

export interface AuthResult {
  user: Omit<User, 'passwordHash'> & { tenantLoginId?: string };
  token: string;
}

const sanitizeUser = (user: User, tenantLoginId?: string): Omit<User, 'passwordHash'> & { tenantLoginId?: string } => {
  const { passwordHash, ...sanitized } = user;
  return {
    ...sanitized,
    ...(tenantLoginId && { tenantLoginId }),
  };
};

export const registerUser = async (data: RegisterInput): Promise<AuthResult> => {
  const { name, email, password, role } = data;
  if (!email || !password || !name) {
    throw new AppError('Name, email, and password are required.', 400);
  }
  
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new AppError('Email is already registered.', 400);
  }
  
  const hashedPassword = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
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
  const { password } = data;
  const rawIdentifier = (data.identifier || data.loginId || data.email || '').trim();

  if (!rawIdentifier || !password) {
    throw new AppError('Please provide Login ID / Email and password.', 400);
  }

  let user: User | null = null;
  let tenantLoginId: string | undefined = undefined;

  // 1. First attempt: Search by email (case-insensitive) if identifier contains '@'
  if (rawIdentifier.includes('@')) {
    user = await prisma.user.findUnique({
      where: { email: rawIdentifier.toLowerCase() },
    });
  }

  // 2. Second attempt: Search tenant by unique loginId (e.g. "Lotus@7K2" or "Spice#91A")
  if (!user) {
    const tenant = await prisma.tenant.findUnique({
      where: { loginId: rawIdentifier },
      include: {
        users: true,
      },
    });

    if (tenant) {
      if (!tenant.isActive) {
        throw new AppError('Tenant account is suspended. Please contact administrator.', 403);
      }

      tenantLoginId = tenant.loginId || undefined;
      // Find admin user or primary user under this tenant
      user = tenant.users.find((u) => u.role === Role.ADMIN) || tenant.users[0] || null;
    }
  }

  // 3. Third attempt: Fallback to exact user email match if first search skipped
  if (!user && !rawIdentifier.includes('@')) {
    user = await prisma.user.findUnique({
      where: { email: rawIdentifier.toLowerCase() },
    });
  }

  if (!user) {
    throw new AppError('Invalid login credentials.', 401);
  }

  // If user belongs to a tenant, check if tenant is active
  if (user.tenantId) {
    const userTenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    if (userTenant) {
      if (!userTenant.isActive) {
        throw new AppError('Tenant property account is currently deactivated.', 403);
      }
      tenantLoginId = userTenant.loginId || undefined;
    }
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid login credentials.', 401);
  }

  const token = signToken({ userId: user.id, role: user.role });
  return {
    user: sanitizeUser(user, tenantLoginId),
    token,
  };
};

export const getUserProfile = async (userId: string): Promise<Omit<User, 'passwordHash'>> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true },
  });
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return sanitizeUser(user, user.tenant?.loginId || undefined);
};