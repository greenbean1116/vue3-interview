<!-- 建立 CourseSchedule.vue：
- 數據：課程表，結構為 { dayName, courses: [{ id, name, time }] }
- 用巢套 v-for 渲染（外層是天數，內層是課程）
- 每個課程有刪除按鈕
- 下方顯示今週總課程數（動態計算） -->

<template lang="">
  <div class="scrollBox">
    <div v-for="(item, index) in courseList" :key="item.dayName">
      <div>dayName: {{ item.dayName }}</div>
      <div>course name:</div>
      <div v-for="courseItem in item.courses" :key="courseItem.id">
        {{ courseItem.name }}
        <button @click="() => handleDeleteItem({ index, courseItemId: courseItem.id })">
          刪除
        </button>
      </div>
      <hr />
    </div>
  </div>
  <div>總課程數：{{ totalCourse }}</div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'

type TDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
interface ICourse {
  dayName: TDay
  courses: {
    id: number
    name: string
    time: number
  }[]
}
const createCourse = () => {
  const count = Math.floor(Math.random() * 10)
  const courses = []
  for (let i = 0; i < count; i++) {
    const newId = Math.floor(Math.random() * 1000)
    courses.push({
      id: newId,
      name: `class-${newId}`,
      time: 2,
    })
  }
  return courses
}
const courseList = ref<ICourse[]>([
  {
    dayName: 'mon',
    courses: createCourse(),
  },
  {
    dayName: 'tue',
    courses: createCourse(),
  },
  {
    dayName: 'wed',
    courses: createCourse(),
  },
  {
    dayName: 'thu',
    courses: createCourse(),
  },
  {
    dayName: 'fri',
    courses: createCourse(),
  },
  {
    dayName: 'sat',
    courses: createCourse(),
  },
  {
    dayName: 'sun',
    courses: createCourse(),
  },
])
const handleDeleteItem = ({ index, courseItemId }: { index: number; courseItemId: number }) => {
  if (courseList.value[index]) {
    courseList.value[index].courses = courseList.value[index].courses.filter(
      (item) => item.id !== courseItemId,
    )
  }
}
const totalCourse = computed(() => {
  let total = 0
  courseList.value.forEach((item) => {
    total += item.courses.length
  })
  return total
})
</script>
<style scoped lang="scss">
.scrollBox {
  height: 500px;
  overflow-y: auto;
}
</style>
