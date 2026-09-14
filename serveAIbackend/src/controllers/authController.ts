import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import * as authService from '../services/authService';


export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  sendResponse(res, 201, 'User registered successfully', result);
});


export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  sendResponse(res, 200, 'Login successful', result);
});


export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  sendResponse(res, 200, 'Current user profile fetched successfully', { user });
});

