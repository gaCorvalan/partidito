<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import LoginCard from '~/components/features/LoginCard.vue'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { signInWithGoogle, user } = useAuth()

const returnTo = computed(() => {
  return typeof route.query.returnTo === 'string' ? route.query.returnTo : ''
})

onMounted(() => {
  if (returnTo.value) {
    localStorage.setItem('returnTo', returnTo.value)
  }
})

watch(
  () => user.value,
  (value) => {
    if (value && returnTo.value) {
      localStorage.removeItem('returnTo')
      navigateTo(returnTo.value)
    }
  }
)

const copy = computed(() => {
  if (returnTo.value.startsWith('/create')) {
    return {
      title: 'Inicia sesion para publicar',
      description: 'Necesitas una cuenta para crear un partido.',
      buttonLabel: 'Continuar con Google'
    }
  }
  if (returnTo.value.startsWith('/chats')) {
    return {
      title: 'Inicia sesion para chatear',
      description: 'Accede a las conversaciones de tus partidos.',
      buttonLabel: 'Continuar con Google'
    }
  }
  return {
    title: 'Inicia sesion para unirte',
    description: 'Unete a partidos y coordina con el equipo.',
    buttonLabel: 'Continuar con Google'
  }
})

const handleGoogle = async () => {
  await signInWithGoogle(returnTo.value)
}
</script>

<template>
  <div class="h-full flex flex-col justify-center p-4">
    <LoginCard
      :title="copy.title"
      :description="copy.description"
      :button-label="copy.buttonLabel"
      @google="handleGoogle"
    />
  </div>
</template>
