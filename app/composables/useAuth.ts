import { ref } from 'vue'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

export const useAuth = () => {
  const supabase = useSupabaseClient()

  const user = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] | null>(
    'auth-user',
    () => null
  )

  const signInWithGoogle = async (returnTo?: string) => {
    if (returnTo) {
      localStorage.setItem('returnTo', returnTo)
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: returnTo
          ? `${window.location.origin}/login?returnTo=${encodeURIComponent(returnTo)}`
          : window.location.origin
      }
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
  }

  return {
    user,
    signInWithGoogle,
    signOut
  }
}
