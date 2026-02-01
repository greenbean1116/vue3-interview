<template lang="html">
  <div>{{ msg }}</div>
  <div>{{ description }}</div>
</template>
<script setup lang="ts">
import { watchEffect } from 'vue'

const { hasError, msg, description } = defineProps({
  hasError: { type: Boolean, default: false },
  msg: { type: String, default: 'Welcome Page' },
  description: { type: String, default: 'This is the welcome page component.' },
})

watchEffect(() => {
  if (hasError) {
    throw new Error('WelcomePage error')
  }
  console.log('hasError changed:', hasError)
})
</script>
<style scoped lang="scss"></style>
