import { PrismaClient } from '@prisma/client';

// This is a workaround for the issue of having multiple instances of PrismaClient in development mode.
const globalForPrisma = global as unknown as { prisma:PrismaClient };

// If the PrismaClient instance already exists, use it. Otherwise, create a new instance.
export const prisma = globalForPrisma.prisma || 
    new PrismaClient({
        log : ['query' , 'error' , 'warn'],
    })

    // If the environment is not production, assign the PrismaClient instance to the global object to prevent multiple instances in development mode.
    if(process.env.NODE_ENV !=  'production') {
        globalForPrisma.prisma = prisma;
    }