<template lang="">
  <div>
    <input ref="inputRef" placeholder="Enter text" v-if="isInputShow" />
    <button @click="handleFocusInput">顯示並聚焦輸入框 (不使用 nextTick)</button>
    <button @click="handleNextTick">顯示並聚焦輸入框 (使用 nextTick)</button>
    <button @click="isInputShow = false">隱藏輸入框</button>
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref } from 'vue'

const isInputShow = ref<boolean>(false)
const inputRef = ref<HTMLInputElement>()

const handleFocusInput = () => {
  isInputShow.value = true
  inputRef.value?.focus()
}

const handleNextTick = async () => {
  isInputShow.value = true
  await nextTick()
  inputRef.value?.focus()
}
</script>
<style lang=""></style>
