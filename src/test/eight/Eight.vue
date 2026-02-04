<!-- 建立 SearchLogger.vue：
- 有一個搜尋輸入框（ref: searchTerm）
- 用 watch 監視 searchTerm：當值變化時，記錄到 logs 陣列中（帶時間戳）
- 用 watchEffect 監視：當前搜尋詞長度大於 3 時，設定一個 isValid 的 ref 為 true
- 下方列出所有 logs
- 說明：為什麼 watchEffect 在組件掛載時會先執行一次，而 watch 不會 -->

<template lang="">
  <div>
    <input v-model="searchTerm" placeholder="搜尋" />
  </div>
  <div>isValid: {{ isValid }}</div>
  <div v-for="item in logs" :="item.id">{{ item.content }}</div>
  {{ aaa }}
</template>
<script setup lang="ts">
import { watch, watchEffect, ref, computed } from 'vue'

const searchTerm = ref<string>('')
const logs = ref<{ id: number; content: string }[]>([])
const isValid = ref<boolean>(false)

watch(
  () => searchTerm.value,
  (newV, _) => {
    logs.value.push({
      id: Date.now(),
      content: `${newV} - ${Date.now()}`,
    })
  },
)
watchEffect(() => {
  console.log('bbbbbbbb')
  isValid.value = searchTerm.value.length > 3
})
const aaa = computed(() => {
  console.log('aaaaaaa')

  return isValid.value
})
</script>
<style lang=""></style>
