export interface ChatListItem {
  id: string
  title: string
  timeAgo: string
  timeLabel: string
  lastMessage: string
  participants: number
}

export const useChatsList = () => {
  const chats: ChatListItem[] = [
    {
      id: 'pacheco-padel',
      title: 'Pacheco Padel Center',
      timeAgo: '2 min ago',
      timeLabel: 'Today 19:00',
      lastMessage: 'See you at 7pm!',
      participants: 3
    },
    {
      id: 'central-sports',
      title: 'Central Sports Complex',
      timeAgo: '15 min ago',
      timeLabel: 'Today 20:30',
      lastMessage: 'Anyone bringing extra shoes?',
      participants: 5
    },
    {
      id: 'city-padel',
      title: 'City Padel Courts',
      timeAgo: '1 hour ago',
      timeLabel: 'This week · Wed 17:00',
      lastMessage: 'Looking forward to playing!',
      participants: 2
    }
  ]

  return { chats }
}
