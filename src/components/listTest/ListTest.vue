<template lang="">
  <div>
    <h3>v-for in 測試</h3>
    <ul>
      <li v-for="(item, index) in bookList" :key="item.id">
        {{ index }}: {{ item.name }}
        <br />
        <div v-for="(value, key, index) in item" :key="key">
          {{ key }}: {{ value }} - {{ index }}
        </div>
      </li>
    </ul>
    <h3>v-for of 測試</h3>
    <ul>
      <li v-for="(item, index) of bookList" :key="item.id">
        {{ index }}: {{ item.name }}
        <br />
        <div v-for="(value, key, index) of item" :key="key">
          {{ key }}: {{ value }} - {{ index }}
        </div>
      </li>
    </ul>
    <ul>
      <li v-for="i in 10" :key="i">{{ i }}</li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const bookList = ref<{ name: string; description: string; id: number }[]>([
  { name: 'Book A', description: 'Description A', id: 1 },
  { name: 'Book B', description: 'Description B', id: 2 },
  { name: 'Book C', description: 'Description C', id: 3 },
])
</script>
<style lang=""></style>
