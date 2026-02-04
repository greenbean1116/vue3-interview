<!-- 建立 CounterDemo.vue：
- 用 ref 建立 count
- 用 reactive 建立 state = { name, score }
- 用 reactive 建立一個物件包含 ref：nested = reactive({ inner: ref(0) })
- 模板中分別顯示：count.value、state.name、nested.inner（不需要.value）
- 有按鈕分別增減各個值
- 注意：解構 reactive 物件會失去響應性，這裡演示這個陷阱 -->

<template lang="">
  <div>
    <div>
      count: {{ count }} <button @click="count++">+1</button><button @click="count--">-1</button>
    </div>
    <div>
      state: {{ state.name }} - {{ state.score }} <button @click="state.score++">+1</button
      ><button @click="state.score--">-1</button>
    </div>
    <div>
      nested: {{ nested.inner }} <button @click="nested.inner++">+1</button
      ><button @click="nested.inner--">-1</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'

const count = ref(0)
const state = reactive({ name: 'state', score: 0 })
const nested = reactive({ inner: ref(0) })
</script>
<style lang=""></style>
