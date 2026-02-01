<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-message">
      <h2>⚠️ 组件出错</h2>
      <p>{{ errorMessage }}</p>
      <button @click="reset">重新加载</button>
    </div>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err, vm, info) => {
  hasError.value = true
  errorMessage.value = err instanceof Error ? err.message : String(err)
  console.error('ErrorBoundary caught:', { err, vm, info })

  // 返回 false 表示错误已处理，不继续传播
  return false
})

const reset = () => {
  hasError.value = false
  errorMessage.value = ''
}

defineExpose({ reset })
</script>

<style scoped>
.error-boundary {
  padding: 20px;
  background-color: #fee;
  border: 1px solid #f00;
  border-radius: 4px;
  color: #333;
}

.error-message h2 {
  margin-top: 0;
  color: #d00;
}

button {
  padding: 8px 16px;
  background-color: #f00;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #c00;
}
</style>
