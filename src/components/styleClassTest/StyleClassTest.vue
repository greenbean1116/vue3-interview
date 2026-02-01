<template lang="">
  <div>
    <div :class="{ active: isActive, danger: isDanger }">測試 class、style binding</div>
    <button @click="isActive = !isActive">切換 active 狀態</button>
    <button @click="isDanger = !isDanger">切換 danger 狀態</button>
    <div :class="classRef">測試 classRef</div>
  </div>
  <ChildComponent :class="classRef" :style="{ fontSize: '20px' }" />
</template>
<script setup lang="ts">
import ChildComponent from './ChildComponent.vue'
import { ref, watchEffect } from 'vue'

const isActive = ref(false)
const isDanger = ref(false)
const classRef = ref('')

watchEffect(() => {
  classRef.value = ''
  if (isActive.value) {
    classRef.value += ' active'
  }
  if (isDanger.value) {
    classRef.value += ' danger'
  }
})
</script>
<style scoped lang="scss">
.active {
  border: 2px solid blue;
}
.danger {
  background-color: black;
  color: white;
}
</style>
