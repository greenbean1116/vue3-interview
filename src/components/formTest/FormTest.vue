<template lang="">
  <div>
    <input v-model="inputRef" placeholder="請輸入內容" />
  </div>
  <div>
    <input type="checkbox" id="aaa" v-model="checkedARef" />
    <label for="aaa">我同意aaa</label>
  </div>
  <div>
    <input type="checkbox" id="bbb" v-model="checkedBRef" />
    <label for="bbb">我同意bbb</label>
  </div>
  <div>
    <select v-model="selectedRef">
      <option value="" disabled>請選擇</option>
      <option v-for="(item, index) in optionsRef" :key="item.value" :value="item.value">
        {{ item.label }}
      </option>
    </select>
    <FormChild v-model:selectedRef="selectedRef" :optionsRef="optionsRef" />
  </div>
  <div>
    <input v-model="formRef.title" placeholder="標題" />
    <br />
    <input v-model="formRef.description" placeholder="描述" />
    <br />
    <div>{{ formRef }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import FormChild from './FormChild.vue'

const inputRef = ref<string>('')
const checkedARef = ref<boolean>(false)
const checkedBRef = ref<boolean>(false)
const selectedRef = ref<string>('')
const optionsRef = ref<{ label: string; value: string }[]>([
  { label: '選項一', value: 'option1' },
  { label: '選項二', value: 'option2' },
  { label: '選項三', value: 'option3' },
])
const formRef = ref({
  title: '',
  description: '',
})
console.log({ formRef: formRef.value })

watchEffect(() => {
  console.log('inputRef changed:', inputRef.value)
  console.log('checkedARef changed:', checkedARef.value)
  console.log('checkedBRef changed:', checkedBRef.value)
  console.log('selectedRef changed:', selectedRef.value)
})
</script>
<style lang=""></style>
