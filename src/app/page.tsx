import { createClient } from '@/shared/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)

  const { data: managers } = await supabase.from('managers').select()

  return (
    <ul>
      {managers?.map((manager) => (
        <li key={manager.id}>{manager.first_name}</li>
      ))}
    </ul>
  )
}
