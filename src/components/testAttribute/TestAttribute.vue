<template lang="">
  <div>
    <button
      v-for="attribute in attributes"
      :key="attribute.attr"
      :[attribute.attr]="attribute.value"
      @[attribute.event]="handleEvent"
    >
      {{ attribute.value + ' ' + attribute.event }}
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const attributes = ref<{ attr: string; value: string; event: string }[]>([
  { attr: 'id', value: 'test-id', event: 'click' },
  { attr: 'data-test', value: 'test-data', event: 'mouseover' },
  { attr: 'aria-label', value: 'test-aria', event: 'focus' },
])

const handleEvent = (event: Event) => {
  console.log(`Event ${event.type.toUpperCase()} triggered on`, event.target)
}
</script>
<style lang=""></style>
