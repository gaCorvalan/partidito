export type ChatMessageType = 'system' | 'incoming' | 'outgoing'

export interface ChatMessage {
  id: string
  type: ChatMessageType
  author?: string
  text: string
  time?: string
}

export const useChatThread = () => {
  const title = 'Match Chat'
  const messages: ChatMessage[] = [
    {
      id: 'system-1',
      type: 'system',
      text: 'Juan joined the match'
    },
    {
      id: 'msg-1',
      type: 'incoming',
      author: 'Juan',
      text: 'Hey! Just arrived, parking now',
      time: '19:05'
    },
    {
      id: 'msg-2',
      type: 'incoming',
      author: 'Maria',
      text: "Great, we're setting up",
      time: '19:07'
    },
    {
      id: 'msg-3',
      type: 'incoming',
      author: 'Carlos',
      text: 'See you at 7pm!',
      time: '19:08'
    },
    {
      id: 'msg-4',
      type: 'outgoing',
      author: 'You',
      text: 'Perfect! see you soon',
      time: '19:10'
    }
  ]

  return { title, messages }
}
