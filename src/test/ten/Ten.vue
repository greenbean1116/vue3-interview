<!-- 建立父組件和 Card.vue：
Card.vue 的 props：
  - title (String, 必填)
  - description (String, 預設為 'N/A')
  - color (String, validator: 只允許 'red', 'blue', 'green')
  - count (Number, 預設 0)
父組件用陣列 v-for 生成多張 Card
其中一張故意不傳 color，觀察 console 警告 -->

<template lang="">
  <div v-for="item in cardList" :key="item.title">
    <Card v-bind="item" />
    <br />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Card from './Card.vue'

const cardList = ref([
  {
    title: 'card-1',
    color: 'red',
  },
  {
    title: 'card-2',
    description: 'card-2-des',
    count: 2,
  },
  {
    title: 'card-3',
    description: 'card-3-des',
    color: 'red111',
    count: 2,
  },
])
</script>
<style lang=""></style>
