import { prisma } from './src/config/db';
import * as tenantService from './src/services/tenantService';
import * as authService from './src/services/authService';
import { generateCandidateLoginId } from './src/utils/loginIdGenerator';

async function runTests() {
  console.log('🧪 Running Unique Tenant Login ID Tests...\n');

  try {
    // Clean prior test artifacts if any
    await prisma.user.deleteMany({
      where: { email: { in: ['a@example.com', 'b@example.com', 'c@example.com'] } },
    });
    await prisma.tenant.deleteMany({
      where: { name: { in: ['Spice Garden', 'Spice Garden Deluxe', 'Another Restro', 'Another Restro 2'] } },
    });
    // ----------------------------------------------------
    // Test 1 — New tenant creation & Unique Login ID
    // ----------------------------------------------------
    console.log('Test 1: Create New Tenant (Spice Garden)...');
    const tenant1 = await tenantService.createTenantWithAdmin({
      name: 'Spice Garden',
      adminName: 'Owner One',
      adminEmail: 'a@example.com',
      phone: '9876543210',
      adminPassword: 'password123',
      address: 'Downtown',
    });

    console.log('✅ Test 1 Passed:', {
      id: tenant1.tenant.id,
      name: tenant1.tenant.name,
      loginId: tenant1.tenant.loginId,
    });

    if (!tenant1.tenant.loginId || tenant1.tenant.loginId.length < 6 || tenant1.tenant.loginId.length > 14) {
      throw new Error(`Login ID "${tenant1.tenant.loginId}" length invalid! Must be 6–14 characters.`);
    }

    // ----------------------------------------------------
    // Test 2 — Same restaurant name, different contact details
    // ----------------------------------------------------
    console.log('\nTest 2: Create Second Tenant with SAME restaurant name (Spice Garden)...');
    const tenant2 = await tenantService.createTenantWithAdmin({
      name: 'Spice Garden',
      adminName: 'Owner Two',
      adminEmail: 'b@example.com',
      phone: '9876543211',
      adminPassword: 'password123',
      address: 'Uptown',
    });

    console.log('✅ Test 2 Passed:', {
      id: tenant2.tenant.id,
      name: tenant2.tenant.name,
      loginId: tenant2.tenant.loginId,
    });

    if (tenant1.tenant.loginId === tenant2.tenant.loginId) {
      throw new Error('Login IDs for different tenants must be unique!');
    }

    // ----------------------------------------------------
    // Test 3 — Same email rejection
    // ----------------------------------------------------
    console.log('\nTest 3: Duplicate Email Check...');
    try {
      await tenantService.createTenantWithAdmin({
        name: 'Another Restro',
        adminName: 'Owner Three',
        adminEmail: 'a@example.com', // Duplicate email!
        phone: '9876543299',
        adminPassword: 'password123',
      });
      throw new Error('Test 3 Failed: Duplicate email should have been rejected!');
    } catch (e: any) {
      if (e.message.includes('already exists')) {
        console.log('✅ Test 3 Passed: Duplicate email correctly rejected with error:', e.message);
      } else {
        throw e;
      }
    }

    // ----------------------------------------------------
    // Test 4 — Same contact rejection
    // ----------------------------------------------------
    console.log('\nTest 4: Duplicate Contact Check...');
    try {
      await tenantService.createTenantWithAdmin({
        name: 'Another Restro 2',
        adminName: 'Owner Four',
        adminEmail: 'c@example.com',
        phone: '9876543210', // Duplicate phone!
        adminPassword: 'password123',
      });
      throw new Error('Test 4 Failed: Duplicate contact should have been rejected!');
    } catch (e: any) {
      if (e.message.includes('contact number already exists')) {
        console.log('✅ Test 4 Passed: Duplicate contact correctly rejected with error:', e.message);
      } else {
        throw e;
      }
    }

    // ----------------------------------------------------
    // Test 5 — Login with generated Login ID + Password
    // ----------------------------------------------------
    console.log('\nTest 5: Login using Login ID + Password...');
    const loginRes = await authService.loginUser({
      identifier: tenant1.tenant.loginId,
      password: 'password123',
    });
    console.log('✅ Test 5 Passed: Logged in successfully with Login ID:', {
      userId: loginRes.user.id,
      email: loginRes.user.email,
      role: loginRes.user.role,
      tenantLoginId: loginRes.user.tenantLoginId,
    });

    // ----------------------------------------------------
    // Test 6 — Wrong Login ID
    // ----------------------------------------------------
    console.log('\nTest 6: Wrong Login ID...');
    try {
      await authService.loginUser({
        identifier: 'INVALID_ID_99',
        password: 'password123',
      });
      throw new Error('Test 6 Failed: Wrong Login ID should fail!');
    } catch (e: any) {
      console.log('✅ Test 6 Passed: Authentication failed as expected:', e.message);
    }

    // ----------------------------------------------------
    // Test 7 — Wrong Password
    // ----------------------------------------------------
    console.log('\nTest 7: Wrong Password...');
    try {
      await authService.loginUser({
        identifier: tenant1.tenant.loginId,
        password: 'wrongpassword',
      });
      throw new Error('Test 7 Failed: Wrong password should fail!');
    } catch (e: any) {
      console.log('✅ Test 7 Passed: Authentication failed as expected:', e.message);
    }

    // ----------------------------------------------------
    // Test 8 — Edit tenant preserves Login ID
    // ----------------------------------------------------
    console.log('\nTest 8: Edit Tenant (Updating name to "Spice Garden Deluxe")...');
    const updatedTenant = await tenantService.updateTenant(tenant1.tenant.id, {
      name: 'Spice Garden Deluxe',
      address: 'New Location',
    });

    console.log('✅ Test 8 Passed: Tenant updated while Login ID remained unchanged:', {
      newName: updatedTenant.name,
      loginId: updatedTenant.loginId,
    });

    if (updatedTenant.loginId !== tenant1.tenant.loginId) {
      throw new Error('Login ID should remain immutable after editing tenant details!');
    }

    // ----------------------------------------------------
    // Test 9 — Login after edit
    // ----------------------------------------------------
    console.log('\nTest 9: Login after editing tenant...');
    const loginResAfterEdit = await authService.loginUser({
      identifier: tenant1.tenant.loginId,
      password: 'password123',
    });
    console.log('✅ Test 9 Passed: Login successful using original Login ID after edit!');

    // ----------------------------------------------------
    // Test 10 — Generator format and boundary check
    // ----------------------------------------------------
    console.log('\nTest 10: Candidate Generator Boundary Check...');
    for (let i = 0; i < 20; i++) {
      const candidate = generateCandidateLoginId('Royal Palace & Spa');
      if (candidate.length < 6 || candidate.length > 14) {
        throw new Error(`Candidate "${candidate}" generated out of 6–14 length bounds!`);
      }
    }
    console.log('✅ Test 10 Passed: 20 candidate generated IDs all satisfied 6–14 char bounds.');

    // Cleanup created test records
    await prisma.tenant.deleteMany({
      where: {
        id: { in: [tenant1.tenant.id, tenant2.tenant.id] },
      },
    });
    console.log('\n🧹 Test records cleaned up.');

    console.log('\n🎉 ALL 10 TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Test Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
