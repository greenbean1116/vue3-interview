<template>
  <div>
    <h3>事件修飾符測試</h3>

    <!-- .stop - 阻止事件冒泡 -->
    <div @click="handleOuter" style="padding: 20px; background: lightblue">
      外層 div (點擊會觸發)
      <button @click.stop="handleStop">不會冒泡到外層</button>
      <button @click="handleNormal">會冒泡到外層</button>
    </div>

    <br />

    <!-- .prevent - 阻止預設行為 -->
    <form @submit.prevent="handleSubmit" style="border: 1px solid #ccc; padding: 10px">
      <input v-model="formData" placeholder="輸入後按 Enter 或點提交" />
      <button type="submit">提交 (不會重新整理頁面)</button>
    </form>
    <p>表單資料: {{ formData }}</p>

    <br />

    <!-- .once - 只觸發一次 -->
    <button @click.once="handleOnce">只能點一次 (已點擊 {{ onceCount }} 次)</button>

    <br /><br />

    <!-- .self - 只有點擊自己才觸發 -->
    <div @click.self="handleSelf" style="padding: 30px; background: lightgreen">
      點擊這個綠色區域才會觸發
      <button>點擊按鈕不會觸發外層</button>
      <span style="padding: 10px; background: yellow">點擊黃色也不會觸發</span>
    </div>

    <br />

    <!-- 可以串聯 -->
    <div @click="handleOuter" style="padding: 20px; background: lightcoral">
      外層 div
      <a href="https://vuejs.org" @click.prevent.stop="handleLink"> 連結 (不會跳轉 & 不會冒泡) </a>
    </div>

    <br />

    <div>事件日誌:</div>
    <ul>
      <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
    </ul>

    <!-- get event -->
    <div>
      <button @click="(event) => console.log(event)">取得 event</button>
      <button @click="getEvent($event)">取得 event</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const logs = ref<string[]>([])
const formData = ref('')
const onceCount = ref(0)

const addLog = (message: string) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
  if (logs.value.length > 10) logs.value.pop()
}

const handleOuter = () => {
  addLog('外層 div 被點擊 (事件冒泡)')
}

const handleStop = () => {
  addLog('按鈕點擊 (阻止冒泡 .stop)')
}

const handleNormal = () => {
  addLog('按鈕點擊 (會冒泡)')
}

const handleSubmit = () => {
  addLog(`表單提交 (阻止預設行為 .prevent): ${formData.value}`)
}

const handleOnce = () => {
  onceCount.value++
  addLog('只能點一次的按鈕 (.once)')
}

const handleSelf = () => {
  addLog('點擊了綠色區域本身 (.self)')
}

const handleLink = () => {
  addLog('連結被點擊 (阻止跳轉 & 冒泡 .prevent.stop)')
}

const getEvent = (event: Event) => {
  console.log('事件對象:', event)
}
</script>

<style scoped>
button,
a {
  margin: 5px;
  padding: 5px 10px;
}

ul {
  max-height: 200px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 10px;
  font-family: monospace;
  font-size: 12px;
}

li {
  padding: 2px 0;
}
</style>
