<template>
  <div class="lifecycle-test">
    <h3>生命週期測試</h3>

    <div>
      <p>計數器: {{ count }}</p>
      <button @click="count++">增加</button>
    </div>

    <div>
      <p>訊息: {{ message }}</p>
      <input v-model="message" placeholder="輸入訊息" />
    </div>

    <div>
      <button @click="showChild = !showChild">{{ showChild ? '隱藏' : '顯示' }}子元件</button>
    </div>

    <ChildComponent v-if="showChild" :count="count" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  watch,
  nextTick,
} from 'vue'
import ChildComponent from './ChildComponent.vue'

const count = ref(0)
const message = ref('')
const showChild = ref(true)

const addLog = (msg: string) => {
  console.log(msg)
}

// ===== 生命週期鉤子 =====

// setup 本身就是最早執行的
addLog('🔵 setup: 元件設定階段（最早執行）')

onBeforeMount(() => {
  addLog('🟡 onBeforeMount: 即將掛載到 DOM')
})

onMounted(() => {
  addLog('🟢 onMounted: 已掛載到 DOM，可以存取 DOM 元素')
  // 這裡可以做：
  // - 發送 API 請求
  // - 設定事件監聽器
  // - 初始化第三方套件
})

onBeforeUpdate(() => {
  addLog('🟠 onBeforeUpdate: 資料改變，DOM 即將更新')
})

onUpdated(() => {
  addLog('🔴 onUpdated: DOM 已更新完成')
  // 注意：不要在這裡修改響應式資料，會造成無限迴圈
})

onBeforeUnmount(() => {
  addLog('🟣 onBeforeUnmount: 元件即將被卸載')
  // 這裡做清理工作：
  // - 移除事件監聽器
  // - 清除定時器
  // - 取消 API 請求
})

onUnmounted(() => {
  addLog('⚫ onUnmounted: 元件已被卸載')
})

// ===== 監聽器 =====

watch(count, (newVal, oldVal) => {
  addLog(`👀 watch count: ${oldVal} → ${newVal}`)
})

watch(message, (newVal) => {
  addLog(`👀 watch message: "${newVal}"`)
})

// ===== 測試 nextTick =====

watch(count, async (newVal) => {
  addLog(`⏳ 更新前: DOM 可能還沒更新`)

  await nextTick()

  addLog(`✅ 更新後: DOM 已經更新完成`)
})
</script>

<style scoped>
.lifecycle-test {
  padding: 20px;
  border: 2px solid #ccc;
  border-radius: 8px;
}

button {
  margin: 5px;
  padding: 8px 16px;
  cursor: pointer;
}

input {
  padding: 5px;
  margin: 5px;
}

.logs {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.logs h4 {
  margin-top: 0;
}

.logs ul {
  list-style: none;
  padding: 0;
  font-family: monospace;
  font-size: 12px;
}

.logs li {
  padding: 4px 0;
  border-bottom: 1px solid #ddd;
}
</style>
