<template lang="">
  <div>
    <ChildComponent :title="title" @[emitKeys.updateTitle]="handleUpdateTitle">
      <template #description>
        <div>{{ description }}</div>
      </template>
      <template #content>
        <div>{{ content }}</div>
      </template>
    </ChildComponent>
    <button @click="handleUpdateDescription">更新描述</button>
    <hr />
    <keep-alive>
      <component :is="showInput ? InputComponent : 'div'"> 這是一個內容!!! </component>
    </keep-alive>
    <button @click="showInput = !showInput">切換顯示</button>
  </div>
</template>
<script setup lang="ts">
import ChildComponent from './ChildComponent.vue'
import InputComponent from './InputComponent.vue'
import { emitKeys } from './const/emitKeys'
import { ref } from 'vue'

const title = ref('我是標題')
const description = ref('我是描述')
const content = ref('我是內容')
const showInput = ref(true)
const handleUpdateTitle = (newTitle: string) => {
  title.value = newTitle
}
const handleUpdateDescription = () => {
  description.value += '1'
}
</script>
<style lang=""></style>
