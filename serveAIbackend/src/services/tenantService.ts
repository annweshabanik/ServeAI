import { Role, Tenant, User } from '@prisma/client';
import { prisma } from '../config/db';
import { hashPassword } from '../utils/hash';
import { AppError } from '../utils/appError';

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
}

export interface TenantWithAdmin {
  id: string;
  name: string;
  slug: string | null;
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

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail.trim().toLowerCase() },
  });
  if (existingUser) {
    throw new AppError('An account with this admin email already exists.', 400);
  }

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: generatedSlug },
  });
  if (existingTenant) {
    throw new AppError('A property with this slug/name already exists.', 400);
  }

  const hashedPassword = await hashPassword(adminPassword);

  return await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        address: address ? address.trim() : null,
        phone: phone ? phone.trim() : null,
        isActive: true,
      },
    });

    const adminUser = await tx.user.create({
      data: {
        name: adminName.trim(),
        email: adminEmail.trim().toLowerCase(),
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

  return tenants.map((tenant) => {
    const adminUser = tenant.users.find((u) => u.role === Role.ADMIN) || tenant.users[0];
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      address: tenant.address,
      phone: tenant.phone,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      userCount: tenant.users.length,
      adminEmail: adminUser ? adminUser.email : null,
      adminName: adminUser ? adminUser.name : null,
    };
  });
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

  const adminUser = tenant.users.find((u) => u.role === Role.ADMIN) || tenant.users[0];

  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
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

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.slug && { slug: data.slug.trim() }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return updatedTenant;
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
