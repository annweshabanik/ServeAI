import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/appError';
import { sendResponse } from '../utils/apiResponse';

export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Custom AppError Check
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle Prisma Unique Constraint Errors (e.g. Duplicate Email)
  if (err.code === 'P2002') {
    statusCode = 400;
    const target = err.meta?.target ? (err.meta.target as string[]).join(', ') : 'Field';
    message = `Duplicate value error: ${target} already exists.`;
  }

  // Handle Invalid JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  // Handle Expired JWT Tokens
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  // Send standardized JSON error response
  sendResponse(res, statusCode, message);
};