<template>
  <div class="child-component">
    <h4>子元件</h4>
    <p>從父元件接收的 count: {{ count }}</p>
    <p>子元件自己的狀態: {{ childState }}</p>
    <button @click="childState++">增加子元件狀態</button>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  watch,
} from 'vue'

const props = defineProps<{
  count: number
}>()

const childState = ref(0)

console.log('🔵 子元件 setup')

onBeforeMount(() => {
  console.log('🟡 子元件 onBeforeMount')
})

onMounted(() => {
  console.log('🟢 子元件 onMounted')
})

onBeforeUpdate(() => {
  console.log('🟠 子元件 onBeforeUpdate')
})

onUpdated(() => {
  console.log('🔴 子元件 onUpdated')
})

onBeforeUnmount(() => {
  console.log('🟣 子元件 onBeforeUnmount')
})

onUnmounted(() => {
  console.log('⚫ 子元件 onUnmounted')
})

watch(
  () => props.count,
  (newVal) => {
    console.log(`👀 子元件監聽到 props.count 變化: ${newVal}`)
  },
)
</script>

<style scoped>
.child-component {
  margin-top: 15px;
  padding: 15px;
  background: #e8f4f8;
  border-radius: 4px;
  border: 2px dashed #4a90e2;
}
</style>
