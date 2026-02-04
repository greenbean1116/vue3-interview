<template lang="">
  <div>
    <div>title: {{ cardProps.title }}</div>
    <div>description: {{ cardProps.description }}</div>
    <div>color: {{ cardProps.color }}</div>
    <div>count: {{ cardProps.count }}</div>
  </div>
</template>
<script setup lang="ts">
import type { ICard } from './types'
const cardProps = withDefaults(defineProps<ICard>(), {
  description: 'N/A',
  count: 0,
})
// const cardProps = defineProps({
//   title: { type: String, required: true },
//   description: { type: String, default: 'N/A' },
//   color: {
//     type: String,
//     required: true,
//     validator: (value: string) => ['red', 'blue', 'green'].includes(value),
//   },
//   count: { type: Number, default: 0 },
// })
</script>
<style lang=""></style>
