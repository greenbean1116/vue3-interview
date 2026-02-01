<template lang="">
  <div>
    <div>{{ count }}</div>
    <div>{{ doubleCount }}</div>
    <div>{{ getDoubleCount() }}</div>
    <button @click="addCount">add count</button>
    <div>{{ otherState }}</div>
    <button @click="addOtherState">add other state</button>
    <div>{{ now }}</div>
  </div>
  <div>
    <div>{{ firstName }}</div>
    <div>{{ lastName }}</div>
    <div>{{ fullName }}</div>
    <button @click="fullName = 'Jane Smith'">set fullName to 'Jane Smith'</button>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const otherState = ref(0) // 用於測試純函數是否依賴其他狀態

// 用 let 而不是 ref，避免觸發響應
let computedCallCount = 0
let functionCallCount = 0

const doubleCount = computed(() => {
  computedCallCount++
  console.log('computed 被計算了:', computedCallCount)
  return count.value * 2
})
const getDoubleCount = () => {
  functionCallCount++
  console.log('函式被執行了:', functionCallCount)
  return count.value * 2
}
const addCount = () => {
  count.value++
}
const addOtherState = () => {
  otherState.value++
}
const now = computed(() => Date.now())

const firstName = ref('John')
const lastName = ref('Doe')
const fullName = computed({
  // getter
  get() {
    return firstName.value + ' ' + lastName.value
  },
  // setter
  set(newValue: string) {
    const [first, last] = newValue.split(' ')
    firstName.value = first || ''
    lastName.value = last || ''
  },
})
</script>
<style lang=""></style>
