import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SupabaseService } from '@/services/supabaseService'

export const useSupabase = () => {
  const { user } = useAuth()

  const service = useMemo(() => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }
    return new SupabaseService(user.id)
  }, [user])

  return service
} 