<template lang="">
  <h2 class="title">標題：{{ title }}</h2>
  <slot></slot>
  <br />
</template>
<script setup lang="ts">
defineProps({
  title: { type: String, required: true },
})
</script>
<style scoped lang="scss">
.title {
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}
</style>
