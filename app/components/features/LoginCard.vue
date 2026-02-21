<template>
  <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-foreground">{{ resolvedTitle }}</h1>
      <p class="text-sm text-muted-foreground">
        {{ resolvedDescription }}
      </p>
    </div>

    <button
      class="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      type="button"
      @click="$emit('google')"
    >
      {{ resolvedButtonLabel }}
    </button>

    <p class="text-xs text-muted-foreground text-center">
      {{ t('login.terms') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  title?: string
  description?: string
  buttonLabel?: string
}>()

const resolvedTitle = computed(() => props.title ?? t('login.card.defaultTitle'))
const resolvedDescription = computed(() => props.description ?? t('login.card.defaultDesc'))
const resolvedButtonLabel = computed(() => props.buttonLabel ?? t('login.button.google'))

defineEmits<{
  google: []
}>()
</script>
