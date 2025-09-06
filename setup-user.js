// Setup script to create a user in the database with proper associations
// Run this with: node setup-user.js

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You need this key for admin operations

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables. Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function setupUser(phoneNumber) {
  try {
    console.log('Setting up user for phone:', phoneNumber);

    // 1. First, find the user by phone number in auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers.users.find(user => user.phone === phoneNumber);

    if (!authUser) {
      console.error('User not found in auth.users with phone:', phoneNumber);
      console.log('Available users:', authUsers.users.map(u => ({ id: u.id, phone: u.phone, email: u.email })));
      return;
    }

    console.log('Found auth user:', { id: authUser.id, phone: authUser.phone });

    // 2. Create or find organization
    let { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', 'Default Organization')
      .single();

    if (orgError || !organization) {
      console.log('Creating default organization...');
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert([{
          name: 'Default Organization',
          description: 'Default organization for testing',
          industry: 'technology',
          company_size: '1-10',
          website: 'https://example.com'
        }])
        .select()
        .single();

      if (createOrgError) {
        console.error('Error creating organization:', createOrgError);
        return;
      }
      organization = newOrg;
    }

    console.log('Using organization:', organization.id);

    // 3. Create manager record
    let { data: manager, error: managerError } = await supabase
      .from('managers')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    if (managerError || !manager) {
      console.log('Creating manager record...');
      const { data: newManager, error: createManagerError } = await supabase
        .from('managers')
        .insert([{
          user_id: authUser.id,
          first_name: 'Test',
          last_name: 'Manager',
          position: 'Manager',
          phone: phoneNumber
        }])
        .select()
        .single();

      if (createManagerError) {
        console.error('Error creating manager:', createManagerError);
        return;
      }
      manager = newManager;
    }

    console.log('Using manager:', manager.id);

    // 4. Create organization_users association
    const { data: orgUser, error: orgUserError } = await supabase
      .from('organization_users')
      .select('id')
      .eq('manager_id', manager.id)
      .eq('organization_id', organization.id)
      .single();

    if (orgUserError || !orgUser) {
      console.log('Creating organization_users association...');
      const { data: newOrgUser, error: createOrgUserError } = await supabase
        .from('organization_users')
        .insert([{
          manager_id: manager.id,
          organization_id: organization.id,
          role: 'admin'
        }])
        .select()
        .single();

      if (createOrgUserError) {
        console.error('Error creating organization_users:', createOrgUserError);
        return;
      }
      console.log('Created organization_users association:', newOrgUser.id);
    } else {
      console.log('Organization_users association already exists:', orgUser.id);
    }

    console.log('✅ User setup completed successfully!');
    console.log('User can now access the application with organization:', organization.id);

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Get phone number from command line argument
const phoneNumber = process.argv[2];

if (!phoneNumber) {
  console.log('Usage: node setup-user.js "+7XXXXXXXXXX"');
  console.log('Example: node setup-user.js "+77001234567"');
  process.exit(1);
}

setupUser(phoneNumber);
