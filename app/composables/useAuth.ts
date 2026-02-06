import { onMounted, ref } from 'vue'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

export const useAuth = () => {
  const supabase = useSupabaseClient()

  const user = ref<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] | null>(null)

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data.user
  }

  const syncProfile = async () => {
    if (!user.value) return
    const fullName =
      user.value.user_metadata?.full_name ||
      user.value.user_metadata?.name ||
      user.value.email ||
      'Usuario'

    await supabase
      .from('profiles')
      .upsert({
        id: user.value.id,
        full_name: fullName
      })
  }

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

  onMounted(() => {
    fetchUser()
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      syncProfile()

      const returnTo = localStorage.getItem('returnTo')
      if (session?.user && returnTo) {
        localStorage.removeItem('returnTo')
        navigateTo(returnTo)
      }
    })
  })

  return {
    user,
    refreshUser: fetchUser,
    signInWithGoogle,
    signOut
  }
}
