<template>
  <div class="bg-card border border-border rounded-2xl p-4 space-y-4">
    <div class="space-y-1">
      <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
      <p class="text-sm text-muted-foreground">
        {{ description }}
      </p>
    </div>

    <button
      class="w-full py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      type="button"
      @click="$emit('google')"
    >
      {{ buttonLabel }}
    </button>

    <p class="text-xs text-muted-foreground text-center">
      Al continuar aceptas nuestros terminos y politica de privacidad.
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    buttonLabel?: string
  }>(),
  {
    title: 'Iniciar sesion',
    description: 'Entra para unirte a partidos y chatear con tu equipo.',
    buttonLabel: 'Continuar con Google'
  }
)

defineEmits<{
  google: []
}>()
</script>
