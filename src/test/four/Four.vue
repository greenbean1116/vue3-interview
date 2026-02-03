<!-- 建立 TodoList.vue：
- 數據：陣列 todos，每項有 { id, text, done }
- 功能：新增、刪除、標記完成（點擊切換 done）
- 用 v-for 渲染列表，完成的項目加刪除線樣式
- 用 v-if 顯示「目前無待辦事項」的訊息（當陣列為空）
- 用 v-show 控制「清除已完成」按鈕的顯示（有已完成項目才給show） -->

<template lang="">
  <div class="scrollBox">
    <button @click="handleAddItem">新增</button>
    <button @click="handleClearAllDone" v-show="todoList.some((item) => item.done)">
      清除已完成
    </button>
    <div v-if="todoList.length === 0">目前無待辦事項</div>
    <div v-else v-for="(item, index) in todoList" :key="item.id" class="scrollItem">
      <div :class="{ scrollItemDone: item.done }">{{ item.text }}</div>
      <button @click="() => handleClickDelete(item.id)">刪除</button>
      <button @click="() => handleClickComplete(index)" :disabled="item.done">標記完成</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

interface ITodoList {
  id: number
  text: string
  done: boolean
}
const todoList = ref<ITodoList[]>([])
const handleClickComplete = (index: number) => {
  if (todoList.value[index]) {
    todoList.value[index].done = true
  }
}
const handleClickDelete = (id: number) => {
  todoList.value = todoList.value.filter((item) => item.id !== id)
}
const handleAddItem = (id: number) => {
  const newId = Math.floor(Math.random() * 10000)
  todoList.value = [
    ...todoList.value,
    {
      id: newId,
      text: `代辦事項-${newId}`,
      done: false,
    },
  ]
}
const handleClearAllDone = () => {
  todoList.value = todoList.value.filter((item) => !item.done)
}
</script>
<style scoped lang="scss">
.scrollBox {
  width: 400px;
  height: 400px;
  overflow-y: auto;
  .scrollItem {
    display: flex;
    justify-content: space-between;
  }
  .scrollItemDone {
    text-decoration: line-through;
  }
}
</style>
