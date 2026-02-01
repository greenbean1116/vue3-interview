<template lang="">
  <div style="padding: 20px">
    <h2>Watch 選項測試</h2>

    <!-- Deep 測試 -->
    <section style="border: 2px solid #42b983; padding: 15px; margin-bottom: 20px">
      <h3>1. Deep 深度監聽測試</h3>
      <div>user.profile.name: {{ user.profile.name }}</div>
      <div>user.profile.age: {{ user.profile.age }}</div>
      <button @click="user.profile.name += '!'">修改 name（深層屬性）</button>
      <button @click="user.profile.age++">修改 age（深層屬性）</button>
      <button @click="user = { profile: { name: 'Alice', age: 25 } }">替換整個 user</button>
      <div style="margin-top: 10px; color: #666">
        <div>✅ watch(user, cb, { deep: true }) - 會觸發</div>
        <div>❌ watch(user, cb) - 只有替換整個對象才觸發</div>
      </div>
    </section>

    <!-- Immediate 測試 -->
    <section style="border: 2px solid #ff6b6b; padding: 15px; margin-bottom: 20px">
      <h3>2. Immediate 立即執行測試</h3>
      <div>counter: {{ counter }}</div>
      <button @click="counter++">增加 counter</button>
      <div style="margin-top: 10px; color: #666">
        <div>✅ watch(counter, cb, { immediate: true }) - 創建時立即執行</div>
        <div>❌ watch(counter, cb) - 創建時不執行，只在變化時執行</div>
        <div style="margin-top: 5px; font-weight: bold">
          查看控制台：immediate 的 watch 應該已經輸出了初始值
        </div>
      </div>
    </section>

    <!-- Once 測試 -->
    <section style="border: 2px solid #4ecdc4; padding: 15px; margin-bottom: 20px">
      <h3>3. Once 一次性監聽測試 (Vue 3.4+)</h3>
      <div>clickCount: {{ clickCount }}</div>
      <button @click="clickCount++">增加 clickCount</button>
      <div style="margin-top: 10px; color: #666">
        <div>✅ watch(clickCount, cb, { once: true }) - 只觸發一次後自動停止</div>
        <div>查看控制台：應該只輸出第一次變化</div>
      </div>
    </section>

    <!-- 組合測試 -->
    <section style="border: 2px solid #ffa500; padding: 15px; margin-bottom: 20px">
      <h3>4. 組合選項測試</h3>
      <div>message.text: {{ message.text }}</div>
      <button @click="message.text += '!'">修改 message.text</button>
      <div style="margin-top: 10px; color: #666">
        <div>watch(message, cb, { deep: true, immediate: true })</div>
        <div>→ 創建時立即執行 + 深度監聽所有屬性變化</div>
      </div>
    </section>

    <!-- flush 測試 -->
    <section style="border: 2px solid #9b59b6; padding: 15px; margin-bottom: 20px">
      <h3>5. Flush 時機測試</h3>
      <div ref="flushTestDiv">flushValue: {{ flushValue }}</div>
      <button @click="flushValue++">增加 flushValue</button>
      <div style="margin-top: 10px; color: #666">
        <div>flush: 'pre' (默認) - DOM 更新前執行</div>
        <div>flush: 'post' - DOM 更新後執行</div>
        <div>flush: 'sync' - 同步執行（不推薦）</div>
        <div style="margin-top: 5px">查看控制台查看執行順序</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, watchEffect } from 'vue'

// ==================== 1. Deep 測試 ====================
const user = ref({
  profile: {
    name: 'John',
    age: 30,
  },
})

// 不使用 deep - 只有替換整個對象才觸發
watch(user, (newVal, oldVal) => {
  console.log('👀 [無 deep] user 變化:', newVal.profile.name)
})

// 使用 deep - 深層屬性變化也會觸發
watch(
  user,
  (newVal, oldVal) => {
    console.log('🔍 [有 deep] user 變化:', newVal.profile.name, newVal.profile.age)
  },
  { deep: true },
)

// ==================== 2. Immediate 測試 ====================
const counter = ref(0)

// 不使用 immediate - 創建時不執行
watch(counter, (newVal, oldVal) => {
  console.log('⏱️  [無 immediate] counter 從', oldVal, '變為', newVal)
})

// 使用 immediate - 創建時立即執行
watch(
  counter,
  (newVal, oldVal) => {
    console.log('⚡ [有 immediate] counter 從', oldVal, '變為', newVal)
  },
  { immediate: true },
)

// ==================== 3. Once 測試 ====================
const clickCount = ref(0)

// 使用 once - 只觸發一次
watch(
  clickCount,
  (newVal, oldVal) => {
    console.log('🎯 [once] clickCount 從', oldVal, '變為', newVal, '(只會看到這一次)')
  },
  { once: true },
)

// 對比：沒有 once 的 watch
watch(clickCount, (newVal, oldVal) => {
  console.log('🔄 [普通] clickCount 從', oldVal, '變為', newVal, '(每次都觸發)')
})

// ==================== 4. 組合選項測試 ====================
const message = ref({
  text: 'Hello',
})

// deep + immediate 組合
watch(
  message,
  (newVal, oldVal) => {
    console.log('🌟 [deep + immediate] message.text:', newVal.text)
  },
  {
    deep: true,
    immediate: true,
  },
)

// ==================== 5. Flush 時機測試 ====================
const flushValue = ref(0)
const flushTestDiv = ref<HTMLDivElement>()

// flush: 'sync' - 同步執行
watch(
  flushValue,
  (newVal) => {
    console.log('🔴 [flush: sync] flushValue =', newVal)
    console.log('    DOM 內容:', flushTestDiv.value?.textContent)
  },
  { flush: 'sync' },
)

// flush: 'pre' (默認) - DOM 更新前執行
watch(
  flushValue,
  (newVal) => {
    console.log('🔵 [flush: pre] flushValue =', newVal)
    console.log('    DOM 內容:', flushTestDiv.value?.textContent)
  },
  { flush: 'pre' },
)

// flush: 'post' - DOM 更新後執行
watch(
  flushValue,
  (newVal) => {
    console.log('🟢 [flush: post] flushValue =', newVal)
    console.log('    DOM 內容:', flushTestDiv.value?.textContent)
  },
  { flush: 'post' },
)

// ==================== 額外：手動停止 watch ====================
const autoCount = ref(0)

const stopWatch = watch(autoCount, (newVal) => {
  console.log('🛑 autoCount:', newVal)
  if (newVal >= 3) {
    console.log('🛑 達到 3，自動停止 watch')
    stopWatch() // 手動停止
  }
})

// 測試自動停止
setTimeout(() => {
  autoCount.value = 1
  setTimeout(() => {
    autoCount.value = 2
    setTimeout(() => {
      autoCount.value = 3 // 這次會停止
      setTimeout(() => {
        autoCount.value = 4 // 這次不會觸發
        console.log('🛑 watch 已停止，設置為 4 不會觸發')
      }, 500)
    }, 500)
  }, 500)
}, 1000)

// ==================== 對比測試：watchEffect ====================
console.log('📝 watchEffect 測試開始')
const reactiveCount = ref(0)

// watchEffect - 自動收集依賴，立即執行
const stopEffect = watchEffect(() => {
  console.log('✨ [watchEffect] reactiveCount =', reactiveCount.value)
  if (reactiveCount.value > 3) {
    console.log('✨ reactiveCount 超過 3，自動停止 watchEffect')
    stopEffect() // 手動停止 watchEffect
  }
})

setInterval(() => {
  reactiveCount.value++
}, 2000)
</script>

<style scoped>
section {
  border-radius: 8px;
}

button {
  margin: 5px;
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #369970;
}

h3 {
  margin-top: 0;
}
</style>
