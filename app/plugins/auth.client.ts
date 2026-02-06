export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['supabase'],
  setup(nuxtApp) {
    const supabase = nuxtApp.$supabase
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

      if (process.client && window.location.hash.includes('access_token')) {
        const cleanUrl = window.location.pathname + window.location.search
        window.history.replaceState({}, document.title, cleanUrl)
      }
    })
  }

    init()
  }
})
