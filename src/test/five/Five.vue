<!-- 建立 UserList.vue：
- 數據：使用者陣列，每項有 { id, name, role, active }
- 用 v-for 迴圈，用 :key="id"
- 用 v-if="active" 篩選活躍使用者
- 有一個 select 切換篩選模式：全部 / 活躍 / 停用
- 有「隨機打亂順序」按鈕，觀察 key 的作用（Vue 是否複用組件） -->

<template lang="">
  <div class="scrollBox">
    <div v-for="(item, index) in userList" :key="item.id">
      <div v-if="checkIsShowUser(item)">
        {{ item.name }} - {{ item.role }} - {{ item.active ? '活躍' : '停用' }}
        <input placeholder="ddddd" />
      </div>
    </div>
  </div>
  <select v-model="selectFilter">
    <option value="all">全部</option>
    <option value="active">活躍</option>
    <option value="inactive">停用</option>
  </select>
  <button @click="handleRandom">隨機打亂順序</button>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface IUser {
  id: number
  name: string
  role: 'pm' | 'de' | 'rd'
  active: boolean
}
const userList = ref<IUser[]>([])
const selectFilter = ref<'all' | 'active' | 'inactive'>('all')
const generateUser = (count: number) => {
  for (let i = 0; i < count; i++) {
    const newId = Math.floor(Math.random() * 10000000)
    userList.value.push({
      id: newId,
      name: `user-${newId}`,
      role: 'de',
      active: i % 2 === 0 ? true : false,
    })
  }
}
const checkIsShowUser = (user: IUser) => {
  if (selectFilter.value === 'all') {
    return true
  } else if (selectFilter.value === 'active') {
    return user.active
  } else {
    return !user.active
  }
}
const handleRandom = () => {
  userList.value = [...userList.value].sort(() => Math.random() - 0.5)
}
onMounted(() => {
  generateUser(100)
})
</script>
<style scoped lang="scss">
.scrollBox {
  height: 400px;
  overflow-y: auto;
}
</style>
