<template>
  <div class="border-t border-border p-4 bg-background">
    <div class="flex gap-2">
      <input
        v-model="message"
        type="text"
        placeholder="Type a message..."
        class="flex-1 px-4 py-2.5 bg-input border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      />
      <button
        class="p-2.5 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
        type="button"
        @click="$emit('send', message)"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.488 5.951 1.488a1 1 0 001.169-1.409l-7-14z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const message = ref('')

defineEmits<{
  send: [message: string]
}>()
</script>
