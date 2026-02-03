<!-- 建立 LiveFilter.vue：
- 有一個搜尋框，用 v-model.lazy 綁定（離開焦點才更新）
- 有一個數字輸入，用 v-model.number（確保傳出的是 number 類型）
- 有一個備註框，用 v-model.trim（去掉前後空格）
- 下方有一個 <div> 顯示這三個值的類型（用 typeof）和內容 -->

<template lang="">
  <div>
    <input type="text" v-model.lazy="searchRef" placeholder="搜尋框" />
    <input type="number" v-model.number="numberRef" placeholder="數字輸入" />
    <input type="text" v-model.trim="remarkRef" placeholder="備註框" />
  </div>
  <div>
    搜尋框: {{ typeof searchRef }} - {{ searchRef }}
    <br />
    搜尋框: {{ typeof numberRef }} - {{ numberRef }}
    <br />
    搜尋框: {{ typeof remarkRef }} - {{ remarkRef }}
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

const searchRef = ref('')
const numberRef = ref(0)
const remarkRef = ref('')
</script>
<style lang=""></style>
