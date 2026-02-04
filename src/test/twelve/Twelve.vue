<!-- 結構：GrandParent > Parent > Child
GrandParent：provide 一個 { theme, toggleTheme }
Child：inject 並使用 theme 來切換深色/淺色樣式
Parent：不參與數據傳遞（驗證確實跳過中間層） -->

<template lang="">
  <div>
    <Parent />
  </div>
</template>
<script setup lang="ts">
import { provide, ref } from 'vue'
import Parent from './Parent.vue'
import type { IStore } from './types'

const theme = ref<'black' | 'white'>('black')
const toggleTheme = () => {
  theme.value = theme.value === 'black' ? 'white' : 'black'
}
provide<IStore>('store', {
  theme,
  toggleTheme,
})
</script>
<style lang=""></style>
