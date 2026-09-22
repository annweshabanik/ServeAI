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

export interface SanitizedUser extends Omit<User, 'passwordHash'> {
  tenantLoginId?: string;
  tenantName?: string;
}

export interface AuthResult {
  user: SanitizedUser;
  token: string;
}

const sanitizeUser = (
  user: User & { tenant?: { name: string; loginId: string | null } | null },
  tenantLoginId?: string,
  tenantName?: string
): SanitizedUser => {
  const { passwordHash, ...sanitized } = user;
  const finalTenantName = tenantName || user.tenant?.name || undefined;
  const finalTenantLoginId = tenantLoginId || user.tenant?.loginId || undefined;
  return {
    ...sanitized,
    ...(finalTenantLoginId && { tenantLoginId: finalTenantLoginId }),
    ...(finalTenantName && { tenantName: finalTenantName }),
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
  let tenantName: string | undefined = undefined;

  // 1. First attempt: Search tenant by unique loginId (e.g. "Lotus@7K2" or "Spice#91A")
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
    tenantName = tenant.name;
    // Find admin user or primary user under this tenant
    user = tenant.users.find((u) => u.role === Role.ADMIN) || tenant.users[0] || null;
  }

  // 2. Second attempt: Search user by email if not found via Tenant loginId
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email: rawIdentifier.toLowerCase() },
    });
  }

  if (!user) {
    throw new AppError('Invalid login credentials.', 401);
  }

  // If user belongs to a tenant, check if tenant is active and attach tenant info
  if (user.tenantId) {
    const userTenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    if (userTenant) {
      if (!userTenant.isActive) {
        throw new AppError('Tenant property account is currently deactivated.', 403);
      }
      tenantLoginId = userTenant.loginId || undefined;
      tenantName = userTenant.name;
    }
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid login credentials.', 401);
  }

  const token = signToken({ userId: user.id, role: user.role });
  return {
    user: sanitizeUser(user, tenantLoginId, tenantName),
    token,
  };
};

export const getUserProfile = async (userId: string): Promise<SanitizedUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true },
  });
  if (!user) {
    throw new AppError('User not found.', 404);
  }
  return sanitizeUser(user, user.tenant?.loginId || undefined, user.tenant?.name || undefined);
};