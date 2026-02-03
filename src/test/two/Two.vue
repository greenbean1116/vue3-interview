<!-- 建立一個自定義組件 RangeSlider.vue：
- 內部有兩個 range input（min 和 max）
- 兩個 range input 都可以在 0-100 之間滑動
- 對外暴露的 v-model 值為 [min, max] 陣列
- 規定 min 不能大於 max（使用 watch 強制修正）
- 父組件用 v-model 綁定並實時顯示當前範圍 -->

<template lang="">
  <div>
    <RangeSlider v-model:rangeModel="rangeRef" />
    <div>Min: {{ rangeRef[0] }}, Max: {{ rangeRef[1] }}</div>
  </div>
  <div>
    <input type="text" v-model="aa.name" />
    <input type="text" v-model="aa.age" />
  </div>
</template>
<script setup lang="ts">
import RangeSlider from './RangeSlider.vue'
import { ref, reactive, watch } from 'vue'

const rangeRef = ref([0, 100])

const aa = reactive({
  name: '111',
  age: 2,
})
watch(
  () => ({ ...aa }),
  (newV, oldV) => {
    console.log({ newV, oldV })
  },
)
</script>
<style lang=""></style>

<!-- watch 監聽物件/陣列的重要發現：

❌ 錯誤：直接 watch 物件/陣列 + deep: true
watch(refObj, (newV, oldV) => {
  console.log(newV === oldV)  // true - 無法比對新舊值！
}, { deep: true })

watch(reactiveObj, (newV, oldV) => {
  console.log(newV === oldV)  // true - 無法比對新舊值！
})

✅ 正確：使用 getter 函數 + 解構/複製
watch(() => ({ ...obj.value }), (newV, oldV) => {
  console.log(newV === oldV)  // false - 可以正確比對！
})

watch(() => [...arr.value], (newV, oldV) => {
  console.log(newV === oldV)  // false - 可以正確比對！
})

原因：
- 物件/陣列是引用類型
- deep watch 監聽的是同一個物件的內部變化
- newValue 和 oldValue 都指向同一個記憶體位置
- 用解構/複製會建立新物件，Vue 才能保留舊值的快照

結論：
監聽物件/陣列的內部變化且需要比對新舊值時，
必須用 getter 函數返回新的物件/陣列副本！
-->
