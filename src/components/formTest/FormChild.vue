<template lang="">
  <div>
    <select v-model="selectedRef">
      <option value="" disabled>請選擇</option>
      <option v-for="item in props.optionsRef" :key="item.value" :value="item.value">
        {{ item.label }}
      </option>
    </select>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  optionsRef: { type: Array as () => { label: string; value: string }[], required: true },
})
const selectedRef = defineModel<string>('selectedRef')
</script>
<style lang=""></style>
