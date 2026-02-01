<template lang="">
  <div>
    <div>{{ refState.title }}</div>
    <div>{{ refState.description }}</div>
    <button @click="handleChangeRefTitle">change ref title</button>
    <button @click="handleChangeWholeRefState">change whole ref</button>
  </div>
  <div>
    <div>{{ shallowRefState.title }}</div>
    <div>{{ shallowRefState.description }}</div>
    <button @click="handleChangeShallowRefTitle">change shallow ref title</button>
    <button @click="handleChangeWholeShallowRefState">change whole shallow ref</button>
  </div>
</template>
<script setup lang="ts">
import { ref, shallowRef } from 'vue'

const refState = ref({
  title: 'ref title',
  description: 'ref description',
})

const handleChangeRefTitle = () => {
  refState.value.title = 'changed ref title'
}

const handleChangeWholeRefState = () => {
  refState.value = {
    title: 'changed whole ref title',
    description: 'changed whole ref description',
  }
}

const shallowRefState = shallowRef({
  title: 'shallowRef title',
  description: 'shallowRef description',
})

const handleChangeShallowRefTitle = () => {
  shallowRefState.value.title = 'changed shallowRef title'
}

const handleChangeWholeShallowRefState = () => {
  shallowRefState.value = {
    title: 'changed whole shallowRef title',
    description: 'changed whole shallowRef description',
  }
}
</script>
<style lang=""></style>
