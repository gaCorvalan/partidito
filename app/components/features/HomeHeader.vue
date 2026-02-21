<template>
  <div class="sticky top-0 bg-background border-b border-border p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-balance">Partidito</h1>
      <div
        class="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold overflow-hidden"
      >
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
        <span v-else-if="userInitials">{{ userInitials }}</span>
        <Icon v-else name="lucide:user" class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userInitials?: string
  avatarUrl?: string | null
}>()
</script>
