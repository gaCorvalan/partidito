<template>
  <div class="border-b border-border p-4 bg-background">
    <button
      class="text-primary font-medium text-sm mb-3"
      type="button"
      @click="$emit('back')"
    >
      ← {{ t('chat.back') }}
    </button>
    <h2 class="text-lg font-semibold text-foreground">{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  title: string
}>()

defineEmits<{
  back: []
}>()
</script>
