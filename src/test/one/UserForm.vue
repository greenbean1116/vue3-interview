<template lang="">
  <form class="">
    <div>
      <input type="text" v-model="userForm.name" placeholder="請輸入姓名" />
    </div>
    <div>
      <input
        type="number"
        v-model.number="userForm.age"
        :style="{
          border: userForm.age < 1 || userForm.age > 120 ? '1px solid red' : '1px solid black',
        }"
        placeholder="請輸入年齡"
      />
    </div>
    <div>
      <label> <input type="radio" v-model="userForm.gender" value="man" /> Man </label>
      <label> <input type="radio" v-model="userForm.gender" value="woman" /> Woman </label>
    </div>
    <div>
      <select name="job" id="job-select" v-model="userForm.job">
        <option value="" disabled>--Please choose an option--</option>
        <option value="doctor">doctor</option>
        <option value="nurse">nurse</option>
        <option value="police">police</option>
      </select>
    </div>
    <button @click.prevent="handleFormSubmit">提交</button>
  </form>
</template>
<script setup lang="ts">
import { toRaw } from 'vue'
import type { IUserForm } from './type'
const userForm = defineModel<IUserForm>('userForm')

const handleFormSubmit = (e: FormDataEvent) => {
  console.log({ userForm: toRaw(userForm.value) })
}
</script>
<style lang=""></style>
