import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false
      }
    }
  })

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
})
