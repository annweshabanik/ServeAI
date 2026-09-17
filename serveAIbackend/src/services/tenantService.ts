import { Role, Tenant, User } from '@prisma/client';
import { prisma } from '../config/db';
import { hashPassword } from '../utils/hash';
import { AppError } from '../utils/appError';
import { generateUniqueTenantLoginId } from '../utils/loginIdGenerator';

export interface CreateTenantInput {
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  adminName?: string;
}

export interface TenantWithAdmin {
  id: string;
  name: string;
  slug: string | null;
  loginId: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userCount: number;
  adminEmail: string | null;
  adminName: string | null;
}

export const createTenantWithAdmin = async (data: CreateTenantInput) => {
  const { name, slug, address, phone, adminName, adminEmail, adminPassword } = data;

  if (!name || !adminName || !adminEmail || !adminPassword) {
    throw new AppError('Tenant name, admin name, admin email, and admin password are required.', 400);
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw new AppError('An account with this admin email already exists.', 400);
  }

  if (phone && phone.trim()) {
    const normalizedPhone = phone.trim();
    const existingTenantPhone = await prisma.tenant.findFirst({
      where: { phone: normalizedPhone },
    });
    if (existingTenantPhone) {
      throw new AppError('A tenant with this contact number already exists.', 400);
    }
  }

  let generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existingTenantWithSlug = await prisma.tenant.findUnique({
    where: { slug: generatedSlug },
  });
  if (existingTenantWithSlug) {
    const slugSuffix = Math.floor(100 + Math.random() * 900);
    generatedSlug = `${generatedSlug}-${slugSuffix}`;
  }

  // Generate unique Login ID server-side
  const generatedLoginId = await generateUniqueTenantLoginId(name.trim());
  const hashedPassword = await hashPassword(adminPassword);

  return await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        loginId: generatedLoginId,
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        isActive: true,
      },
    });

    const adminUser = await tx.user.create({
      data: {
        name: adminName.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        tenantId: tenant.id,
      },
    });

    const { passwordHash, ...sanitizedAdmin } = adminUser;

    return {
      tenant,
      admin: sanitizedAdmin,
    };
  });
};

export const getAllTenants = async (): Promise<TenantWithAdmin[]> => {
  const tenants = await prisma.tenant.findMany({
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const processedTenants = await Promise.all(
    tenants.map(async (tenant) => {
      let currentLoginId = tenant.loginId;

      // Auto-backfill loginId for existing tenants if missing
      if (!currentLoginId) {
        currentLoginId = await generateUniqueTenantLoginId(tenant.name);
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { loginId: currentLoginId },
        });
      }

      const adminUser = tenant.users.find((u) => u.role === Role.ADMIN) || tenant.users[0];
      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        loginId: currentLoginId,
        address: tenant.address,
        phone: tenant.phone,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        userCount: tenant.users.length,
        adminEmail: adminUser ? adminUser.email : null,
        adminName: adminUser ? adminUser.name : null,
      };
    })
  );

  return processedTenants;
};

export const getTenantById = async (tenantId: string): Promise<TenantWithAdmin> => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!tenant) {
    throw new AppError('Tenant property not found.', 404);
  }

  let currentLoginId = tenant.loginId;
  if (!currentLoginId) {
    currentLoginId = await generateUniqueTenantLoginId(tenant.name);
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { loginId: currentLoginId },
    });
  }

  const adminUser = tenant.users.find((u) => u.role === Role.ADMIN) || tenant.users[0];

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    loginId: currentLoginId,
    address: tenant.address,
    phone: tenant.phone,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
    userCount: tenant.users.length,
    adminEmail: adminUser ? adminUser.email : null,
    adminName: adminUser ? adminUser.name : null,
  };
};

export const updateTenant = async (tenantId: string, data: UpdateTenantInput) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError('Tenant property not found.', 404);
  }

  // Duplicate contact phone check during edit
  if (data.phone !== undefined && data.phone !== null && data.phone.trim()) {
    const normalizedPhone = data.phone.trim();
    const existingPhone = await prisma.tenant.findFirst({
      where: { phone: normalizedPhone, id: { not: tenantId } },
    });
    if (existingPhone) {
      throw new AppError('Another tenant with this contact number already exists.', 400);
    }
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.slug && { slug: data.slug.trim() }),
      ...(data.address !== undefined && { address: data.address ? data.address.trim() : null }),
      ...(data.phone !== undefined && { phone: data.phone ? data.phone.trim() : null }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      // loginId is NOT modified here; it remains immutable
    },
  });

  if (data.adminName) {
    const adminUser = await prisma.user.findFirst({
      where: { tenantId: tenantId, role: Role.ADMIN },
    });
    if (adminUser) {
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { name: data.adminName.trim() },
      });
    }
  }

  return getTenantById(tenantId);
};

export const deleteTenant = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError('Tenant property not found.', 404);
  }

  await prisma.tenant.delete({
    where: { id: tenantId },
  });

  return { message: 'Tenant property deleted successfully.' };
};

export const getSuperAdminStats = async () => {
  const [totalTenants, activeTenants, totalUsers] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { isActive: true } }),
    prisma.user.count(),
  ]);

  return {
    totalTenants,
    activeTenants,
    inactiveTenants: totalTenants - activeTenants,
    totalUsers,
  };
};

export const toggleTenantStatus = async (tenantId: string, isActive: boolean) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError('Tenant property not found.', 404);
  }

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { isActive },
  });

  return updatedTenant;
};
