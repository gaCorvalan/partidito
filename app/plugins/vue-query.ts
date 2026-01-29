import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
         refetchOnMount: 'always'
      }
    }
  })

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
})
