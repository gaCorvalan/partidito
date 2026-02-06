import { useSupabaseClient } from '~/composables/useSupabaseClient'

export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const user = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] | null>(
    'auth-user',
    () => null
  )

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

  const init = async () => {
    const { data } = await supabase.auth.getUser()
    user.value = data.user
    await syncProfile()

    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      syncProfile()

      const returnTo = localStorage.getItem('returnTo')
      if (session?.user && returnTo) {
        localStorage.removeItem('returnTo')
        navigateTo(returnTo)
      }
    })
  }

  init()
})
