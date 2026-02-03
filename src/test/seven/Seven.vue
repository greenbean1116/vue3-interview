<!-- 建立 ShoppingCart.vue：
- 數據（reactive）：購物車陣列，每項有 { name, price, qty }
- computed：
  - subtotal（小計）
  - tax（稅，小計 * 0.1，取小數點二位）
  - total（總計 = 小計 + 稅）
  - itemCount（總數量）
- 有增減數量的按鈕，數量不得小於 1
- 觀察：只有數據變化時 computed 才重新計算 -->

<template lang="">
  <div></div>
</template>
<script setup lang="ts"></script>
<style lang=""></style>
