<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
  <Title :title="'Life Cycle Test'">
    <LifeCycleTest />
  </Title>
  <Title :title="'Watch Test'">
    <WatchTest />
  </Title>
  <Title :title="'Component Test'">
    <ComponentTest />
  </Title>
  <div>
    <div>user's name: {{ store.user.name }}</div>
    <div>user's age: {{ store.user.age }}</div>
    <input v-model="store.user.name" placeholder="user name" />
    <input v-model="store.user.age" placeholder="user age" />
  </div>
  <div>
    <div>x: {{ x }}</div>
    <div>y: {{ y }}</div>
  </div>
</template>

<script setup lang="ts">
import LifeCycleTest from '@/components/lifeCycleTest/LifeCycleTest.vue'
import WatchTest from '@/components/watchTest/WatchTest.vue'
import ComponentTest from '@/components/componentTest/ComponentTest.vue'
import useComposableTest from '@/hooks/useComposableTest'
import { inject, onUpdated } from 'vue'

const { x, y } = useComposableTest()
const store = inject('store', {
  user: {
    name: '',
    age: 0,
  },
})

onUpdated(() => {
  // console.log('sssss', { x: x.value, y: y.value })
})
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
.shouldBeAbout {
  color: red;
}
</style>
