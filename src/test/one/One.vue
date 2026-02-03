<!-- 建立一個組件 UserForm.vue：
- 包含姓名(text)、年齡(number)、性別(radio)、職業(select)
- 這些都用 v-model 雙向綁定到父組件
- 父組件實時顯示 JSON 預覽（用 <pre> 顯示）
- 年齡輸入框限制為 1-120，超出範圍時標記為紅色 -->

<template lang="">
  <div>
    <UserForm v-model:userForm="userForm" />
    <pre>{{ userForm }}</pre>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import UserForm from './UserForm.vue'
import type { IUserForm } from './type'

const userForm = ref<IUserForm>({
  name: '',
  age: 1,
  gender: 'man',
  job: '',
})
</script>
<style lang="scss">
.formBox {
  display: flex;
  flex-wrap: wrap;
}
</style>

<!-- v-model 雙向綁定筆記：
1. 預設 v-model：
   父：<Child v-model="data" />
   子：defineModel()
   等同於：:modelValue="data" @update:modelValue="data = $event"

2. 具名 v-model（可多個）：
   父：<Child v-model:userForm="form" v-model:count="num" />
   子：defineModel('userForm'), defineModel('count')
   等同於：:userForm="form" @update:userForm="form = $event"

3. v-model 修飾符：
   .number - 自動轉數字（搭配 type="number"）
   .trim - 自動去除前後空白
   .lazy - 改為 change 事件觸發（非 input）
-->
