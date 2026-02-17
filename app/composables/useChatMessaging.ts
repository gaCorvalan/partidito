import { computed, ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '~/composables/useAuth'
import { useSupabaseClient } from '~/composables/useSupabaseClient'

export const useChatMessaging = () => {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = computed(() => user.value?.id ?? null)
  const error = ref<string | null>(null)

  const sendMutation = useMutation({
    mutationFn: async ({ matchId, content, returnTo }: { matchId: string; content: string; returnTo: string }) => {
      if (!userId.value) {
        navigateTo(`/login?returnTo=${encodeURIComponent(returnTo)}`)
        return
      }

      const { error } = await supabase.from('messages').insert({
        match_id: matchId,
        user_id: userId.value,
        type: 'user',
        content
      })

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat', variables.matchId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (mutationError: unknown) => {
      const message = mutationError instanceof Error ? mutationError.message : String(mutationError)
      error.value = message.replace('Error: ', '')
    }
  })

  const sendMessage = async (matchId: string, content: string, returnTo: string) => {
    error.value = null
    await sendMutation.mutateAsync({ matchId, content, returnTo })
  }

  return {
    sendMessage,
    chatStatus: computed(() => ({
      isSending: sendMutation.isPending.value
    })),
    error
  }
}
