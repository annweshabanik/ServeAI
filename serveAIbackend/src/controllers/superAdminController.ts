import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import * as tenantService from '../services/tenantService';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await tenantService.getSuperAdminStats();
  sendResponse(res, 200, 'Super admin stats fetched successfully', stats);
});

export const getTenants = asyncHandler(async (req: Request, res: Response) => {
  const tenants = await tenantService.getAllTenants();
  sendResponse(res, 200, 'Tenants fetched successfully', { tenants });
});

export const getTenantById = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const tenant = await tenantService.getTenantById(tenantId);
  sendResponse(res, 200, 'Tenant fetched successfully', { tenant });
});

export const createTenant = asyncHandler(async (req: Request, res: Response) => {
  const result = await tenantService.createTenantWithAdmin(req.body);
  sendResponse(res, 201, 'Restaurant property and admin account created successfully', result);
});

export const updateTenant = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const tenant = await tenantService.updateTenant(tenantId, req.body);
  sendResponse(res, 200, 'Tenant updated successfully', { tenant });
});

export const updateTenantStatus = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { isActive } = req.body;
  const tenant = await tenantService.toggleTenantStatus(tenantId, Boolean(isActive));
  sendResponse(res, 200, 'Tenant status updated successfully', { tenant });
});

export const deleteTenant = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const result = await tenantService.deleteTenant(tenantId);
  sendResponse(res, 200, 'Tenant deleted successfully', result);
});
