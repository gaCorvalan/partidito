<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import LoginCard from '~/components/features/LoginCard.vue'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { t } = useI18n()
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
      title: t('login.title.create'),
      description: t('login.desc.create'),
      buttonLabel: t('login.button.google')
    }
  }
  if (returnTo.value.startsWith('/chats')) {
    return {
      title: t('login.title.chats'),
      description: t('login.desc.chats'),
      buttonLabel: t('login.button.google')
    }
  }
  return {
    title: t('login.title.default'),
    description: t('login.desc.default'),
    buttonLabel: t('login.button.google')
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
