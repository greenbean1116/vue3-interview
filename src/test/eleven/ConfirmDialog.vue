<template lang="">
  <div>{{ props.message }}</div>
  <button @click="$emit('confirm', 'confirm')">確認</button>
  <button @click="$emit('cancel', 'cancel')">取消</button>
</template>
<script setup lang="ts">
import { watch } from 'vue'
const props = defineProps<{ message: string }>()
const emit = defineEmits(['confirm', 'cancel'])

watch(
  () => props.message,
  (newV, oldV) => {
    if (newV.length > 10) {
      emit('confirm', 'confirm')
    }
  },
)
</script>
<style lang=""></style>
