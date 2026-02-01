<template lang="">
  <div>
    <div>destructure: {{ title }}</div>
    <div>destructure & toRefs:{{ titleRef }}</div>
    <div>{{ reactiveState.title }}</div>
    <div>{{ reactiveState.description }}</div>
    <div>{{ reactiveState.content.info }}</div>
    <button @click="handleChangeReactiveTitle">change reactive title</button>
    <button @click="handleChangeReactiveContentInfo">change reactive content info</button>
    <button @click="handleChangeWholeReactiveState">change whole reactive state</button>
  </div>
  <div>
    <div>{{ shallowReactiveState.title }}</div>
    <div>{{ shallowReactiveState.description }}</div>
    <div>{{ shallowReactiveState.content.info }}</div>
    <button @click="handleChangeShallowReactiveTitle">change shallowReactive title</button>
    <button @click="handleChangeShallowReactiveContentInfo">
      change shallowReactive content info
    </button>
    <button @click="handleChangeWholeShallowReactiveState">
      change whole shallowReactive state
    </button>
  </div>
</template>
<script setup lang="ts">
import { reactive, shallowReactive, toRefs } from 'vue'

let reactiveState = reactive({
  title: 'reactive title',
  description: 'reactive description',
  content: {
    info: 'reactive content info',
  },
})
const handleChangeReactiveTitle = () => {
  reactiveState.title = 'changed reactive title'
}
const handleChangeReactiveContentInfo = () => {
  reactiveState.content.info = 'changed reactive content info'
}
const handleChangeWholeReactiveState = () => {
  Object.assign(reactiveState, {
    title: 'changed whole reactive title',
    description: 'changed whole reactive description',
    content: {
      info: 'changed whole reactive content info',
    },
  })
}
const { title } = reactiveState
const { title: titleRef } = toRefs(reactiveState)

let shallowReactiveState = shallowReactive({
  title: 'shallowReactive title',
  description: 'shallowReactive description',
  content: {
    info: 'shallowReactive content info',
  },
})
const handleChangeShallowReactiveTitle = () => {
  shallowReactiveState.title = 'changed shallowReactive title'
}
const handleChangeShallowReactiveContentInfo = () => {
  shallowReactiveState.content.info = 'changed shallowReactive content info'
}
const handleChangeWholeShallowReactiveState = () => {
  Object.assign(shallowReactiveState, {
    title: 'changed whole shallowReactive title',
    description: 'changed whole shallowReactive description',
    content: {
      info: 'changed whole shallowReactive content info',
    },
  })
  // shallowReactiveState.title = 'changed whole shallowReactive title'
  // shallowReactiveState.description = 'changed whole shallowReactive description'
}
</script>
<style lang=""></style>
