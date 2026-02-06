<script setup lang="ts">
import LoginCard from '~/components/features/LoginCard.vue'
import { useAuth } from '~/composables/useAuth'

const { signInWithGoogle } = useAuth()

const handleGoogle = async () => {
  await signInWithGoogle()
}
</script>

<template>
  <div class="h-full flex flex-col justify-center p-4">
    <LoginCard @google="handleGoogle" />
  </div>
</template>
