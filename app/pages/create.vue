<script setup lang="ts">
import { ref } from 'vue'
import PublishHeader from '~/components/features/PublishHeader.vue'
import PublishSelectField from '~/components/features/PublishSelectField.vue'
import PublishOptionGroup from '~/components/features/PublishOptionGroup.vue'
import PublishLevelGroup from '~/components/features/PublishLevelGroup.vue'
import PublishInputField from '~/components/features/PublishInputField.vue'
import PublishSubmitBar from '~/components/features/PublishSubmitBar.vue'
import { usePublishForm } from '~/composables/usePublishForm'

const { sportOptions, dateOptions, levelOptions, missingPlayersOptions } = usePublishForm()

const sport = ref('padel')
const missingPlayers = ref('1')
const date = ref('today')
const time = ref('19:00')
const venue = ref('')
const level = ref('intermediate')
const price = ref('2500')
const note = ref('')

const handleBack = () => {
  navigateTo('/')
}

const handleSubmit = () => {
  // Placeholder para futura publicacion
}
</script>

<template>
  <div class="h-full flex flex-col bg-background">
    <PublishHeader title="Create match" @back="handleBack" />

    <div class="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
      <PublishSelectField label="Sport" :options="sportOptions" v-model="sport" />

      <PublishOptionGroup
        label="Missing Players"
        :options="missingPlayersOptions"
        v-model="missingPlayers"
      />

      <PublishSelectField label="Date" :options="dateOptions" v-model="date" />

      <PublishInputField label="Time" type="time" v-model="time" />

      <PublishInputField label="Venue" placeholder="e.g., Central Courts" v-model="venue" />

      <PublishLevelGroup label="Level" :options="levelOptions" v-model="level" />

      <PublishInputField label="Price per Player (COP)" type="number" v-model="price" />

      <PublishInputField
        label="Note (optional)"
        placeholder="Add any details about the match..."
        as="textarea"
        :rows="3"
        v-model="note"
      />
    </div>

    <PublishSubmitBar label="Publish match" @submit="handleSubmit" />
  </div>
</template>
