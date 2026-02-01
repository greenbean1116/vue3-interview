<template lang="">
  <h2>{{ title }}</h2>
  <button @click="$emit(emitKeys.updateTitle, '我是新的標題')">更新標題</button>
  <slot name="description"></slot>
  <hr />
  <slot name="content"></slot>
</template>
<script setup lang="ts">
import { emitKeys } from './const/emitKeys'
const props = defineProps({
  title: { type: String },
})
defineEmits([emitKeys.updateTitle])
</script>
<style lang=""></style>
