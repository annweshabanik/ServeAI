import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../config/db';

export const authenticate = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        let token: string | undefined;

        if(
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ){
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token){
            throw new AppError('Authentication token is missing. Please log in.', 401);
        }

        const decoded = verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { tenant: true },
        });

        if (!user) {
            throw new AppError('The user belonging to this token no longer exists.', 401);
        }

        req.user = user;
        next();
    }
);