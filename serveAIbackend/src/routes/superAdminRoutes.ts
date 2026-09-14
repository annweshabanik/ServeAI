import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import * as superAdminController from '../controllers/superAdminController';

const router = Router();

// Protect all routes under /superadmin with SUPERADMIN role check
router.use(authenticate, authorizeRoles(Role.SUPERADMIN));

router.get('/stats', superAdminController.getStats);
router.get('/tenants', superAdminController.getTenants);
router.post('/tenants', superAdminController.createTenant);
router.get('/tenants/:id', superAdminController.getTenantById);
router.put('/tenants/:id', superAdminController.updateTenant);
router.patch('/tenants/:id/status', superAdminController.updateTenantStatus);
router.delete('/tenants/:id', superAdminController.deleteTenant);

export default router;
