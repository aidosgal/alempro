'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/entities/auth';
import { createClient } from '@/shared/supabase/client';
import DefaultLayout from '@/widgets/layout/DefaultLayout';

export default function DebugPage() {
  const { user } = useAuthStore();
  const supabase = createClient();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function debugUserAccess() {
      if (!user) {
        setDebugInfo({ error: 'No user logged in' });
        setLoading(false);
        return;
      }

      try {
        const info: any = {
          user: {
            id: user.id,
            phone: user.phone,
            email: user.email
          }
        };

        // Check if user exists in managers table
        const { data: manager, error: managerError } = await supabase
          .from('managers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        info.manager = { data: manager, error: managerError?.message };

        if (manager) {
          // Check organization_users association
          const { data: orgUser, error: orgError } = await supabase
            .from('organization_users')
            .select('*, organization:organizations(*)')
            .eq('manager_id', manager.id);

          info.organizationUsers = { data: orgUser, error: orgError?.message };
        }

        // Also check all managers to see what exists
        const { data: allManagers, error: allManagersError } = await supabase
          .from('managers')
          .select('*');

        info.allManagers = { data: allManagers, error: allManagersError?.message };

        setDebugInfo(info);
      } catch (error: any) {
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    }

    debugUserAccess();
  }, [user, supabase]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="p-6">
          <div className="text-center">Loading debug info...</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Debug User Access</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </DefaultLayout>
  );
}
