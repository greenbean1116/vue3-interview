<template lang="">
  <div>
    <table>
      <tr>
        <td v-for="item in tableHeaderList">{{ item }}</td>
      </tr>

      <tr>
        <td v-for="user in usersRef">{{ item }}</td>
      </tr>
    </table>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockUsers } from '@/question/mockUsers'

const usersRef = ref(mockUsers)
const tableHeaderList = computed(() => {
  return Object.keys(usersRef).map((item) => item)
})
console.log({ tableHeaderList })
</script>
<style lang=""></style>
