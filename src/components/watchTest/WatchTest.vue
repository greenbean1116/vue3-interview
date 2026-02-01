<template lang="">
  <div>
    <div>countA: {{ countA }}</div>
    <div>countA history change: {{ history }}</div>
    <button @click="countA++">增加 countA</button>
  </div>
  <div>
    <div>countBRef: {{ countBRef }}</div>
    <button @click="countBRef++">增加 countBRef</button>
  </div>
  <div>
    <div>{{ content.a }}</div>
    <div>contentRef.content.a: {{ contentRef.content.a }}</div>
    <button @click="contentRef.content.a += 1">修改 contentRef.content.a</button>
  </div>
  <div>
    <div>contentReactive.content.a: {{ contentReactive.content.a }}</div>
    <button @click="contentReactive.content.a += 1">修改 contentReactive.content.a</button>
  </div>
  <hr />
  <ModifyTest />
</template>
<script setup lang="ts">
import ModifyTest from './ModifyTest.vue'
import { ref, reactive, watch } from 'vue'

const countA = ref(0)
const history = ref('')

const countBRef = ref(0)
const contentRef = ref({ title: 'hello', description: 'watch test', content: { a: 1 } })
const contentReactive = reactive({ title: 'hello', description: 'watch test', content: { a: 1 } })
console.log({
  countBRef,
  countBRefValue: countBRef.value,
  contentRef,
  contentRefTitle: contentRef.value.title,
  contentRefContentA: contentRef.value.content.a,
  contentReactive,
  contentReactiveTitle: contentReactive.title,
  contentReactiveContentA: contentReactive.content.a,
})

watch(countA, (newVal, oldVal) => {
  console.log('newVal: ', newVal, ', oldVal: ', oldVal)
  history.value += ' -> ' + newVal.toString()
})
const aaa = () => {
  console.log('kkkkkkkkkkkk')
  return contentRef.value.content.a
}
console.log({ aaa })
watch(aaa, (newVal, oldVal) => {
  console.log('aaaaa: ', newVal, ', bbbb: ', oldVal)
  console.log({ aaa })
})
watch(contentReactive.content, (newVal, oldVal) => {
  console.log('ccccc: ', newVal, ', dddd: ', oldVal)
})
watch(contentReactive, (newVal, oldVal) => {
  console.log('eeeee: ', newVal, ', ffff: ', oldVal)
})
const { content } = contentRef.value
console.log({ content })

watch(
  () => countA.value,
  (newVal, oldVal) => {
    console.log('countA changed from ', oldVal, ' to ', newVal)
  },
)
</script>
<style lang=""></style>
