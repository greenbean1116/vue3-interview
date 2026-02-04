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
  <div>
    <h3>購物車</h3>
    <div v-for="item in cart" :key="item.name">
      <div>name: {{ item.name }}</div>
      <div>price: {{ item.price }}</div>
      <div>qty: {{ item.qty }}</div>
      <button @click="item.qty++">+1</button>
      <button @click="item.qty--" :disabled="item.qty === 1">-1</button>
    </div>
    <h3>總結</h3>
    <div>
      <div>subtotal（小計）: {{ totalContent.subtotal }}</div>
      <div>tax（稅，小計）: {{ totalContent.tax }}</div>
      <div>total（總計）: {{ totalContent.total }}</div>
      <div>itemCount（總數量）: {{ totalContent.itemCount }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, computed } from 'vue'

interface ICart {
  name: string
  price: number
  qty: number
}
const cart = reactive<ICart[]>([
  { name: 'apple', price: 11, qty: 2 },
  { name: 'banana', price: 12, qty: 2 },
  { name: 'cat', price: 13, qty: 3 },
])

const totalContent = computed(() => {
  const subtotal = cart.reduce(
    (accumulator, currentValue) => accumulator + currentValue.price * currentValue.qty,
    0,
  )
  const tax = Number((subtotal * 0.1).toFixed(2))
  return {
    subtotal,
    tax,
    total: subtotal + tax,
    itemCount: cart.reduce((acc, curV) => acc + curV.qty, 0),
  }
})
</script>
<style lang=""></style>

<!-- 你學到的 reduce 重點筆記：
基本語法
參數說明
accumulator（累積器）：上一次回調的返回值，或初始值
currentValue（當前值）：當前正在處理的元素
initialValue（初始值）：第一次調用時的累積器初始值 -->
