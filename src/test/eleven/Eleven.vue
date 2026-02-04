<!-- 建立 ConfirmDialog.vue：
- props: { message }
- emits: ['confirm', 'cancel']
- 有「確認」和「取消」按鈕，分別 emit
父組件：
- 有一個「刪除使用者」按鈕，點擊後顯示 ConfirmDialog
- 根據 confirm/cancel 更新狀態並顯示結果訊息 -->

<template lang="">
  <div>
    <button @click="isDialogOpen = true">刪除使用者</button>
    結果: {{ result }}
  </div>
  <input v-model="message" />
  <ConfirmDialog
    v-if="isDialogOpen"
    :message="message"
    @confirm="handleStatus"
    @cancel="handleStatus"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue'
import ConfirmDialog from './ConfirmDialog.vue'

const message = ref('message')
const isDialogOpen = ref(false)
const result = ref<'confirm' | 'cancel'>()

const handleStatus = (status: 'confirm' | 'cancel') => {
  result.value = status
  isDialogOpen.value = false
}
</script>
<style lang=""></style>
