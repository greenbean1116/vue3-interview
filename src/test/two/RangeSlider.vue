<template lang="">
  <div>
    <!-- min -->
    <input type="range" min="0" max="100" v-model.number="rangeModel[0]" />
    <!-- max -->
    <input type="range" min="0" max="100" v-model.number="rangeModel[1]" />
  </div>
</template>
<script setup lang="ts">
import { watch } from 'vue'
import type { ModelRef } from 'vue'
const rangeModel = defineModel<number[]>('rangeModel') as ModelRef<number[]>

watch(
  () => [...rangeModel.value],
  (newValue, oldValue) => {
    if (typeof newValue[0] !== 'number' || typeof newValue[1] !== 'number') return
    if (typeof oldValue[0] !== 'number' || typeof oldValue[1] !== 'number') return

    // min bar change
    if (newValue[0] !== oldValue[0]) {
      if (newValue[0] > oldValue[1]) {
        rangeModel.value = oldValue
      }
    }
    // max bar change
    if (newValue[1] !== oldValue[1]) {
      if (newValue[1] < oldValue[0]) {
        rangeModel.value = oldValue
      }
    }
  },
)
</script>
<style lang=""></style>
