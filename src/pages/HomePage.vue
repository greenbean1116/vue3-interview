<template>
  <Title :title="'app.config、app.component'">
    <button @click="triggerError">
      Trigger Error, now is {{ hasError ? 'error' : 'no error' }}
    </button>
    <ErrorBoundary ref="errorBoundaryRef">
      <WelcomeMessage :hasError="hasError" v-bind="welcomeProps"></WelcomeMessage>
    </ErrorBoundary>
  </Title>
  <Title :title="'Template'">
    <div v-html="rawHtml"></div>
    <div :class="clickCount % 2 ? 'odd' : 'even'">
      上面的 error 按鈕已經點擊了 {{ clickCount }} 次
    </div>
    <div v-if="clickCount % 2">ODD</div>
    <div v-else>EVEN</div>
    <TestAttribute />
    <ModifiersTest />
  </Title>
  <Title :title="'Reactivity'">
    <RefShallowTest />
    <NextTickTest />
    <ReactiveShallowTest />
  </Title>
  <Title :title="'Computed'">
    <ComputedTest />
  </Title>
  <Title :title="'Style Class Test'">
    <StyleClassTest />
  </Title>
  <Title :title="'List Test'">
    <ListTest />
  </Title>
  <Title :title="'Form Test'">
    <FormTest />
  </Title>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import WelcomeMessage from '@/components/welcome/WelcomeMessage.vue'
import TestAttribute from '@/components/testAttribute/TestAttribute.vue'
import ModifiersTest from '@/components/modifiersTest/ModifiersTest.vue'
import RefShallowTest from '@/components/refShallowTest/RefShallowTest.vue'
import NextTickTest from '@/components/nextTickTest/NextTickTest.vue'
import ReactiveShallowTest from '@/components/reactiveShallowTest/ReactiveShallowTest.vue'
import ComputedTest from '@/components/computedTest/ComputedTest.vue'
import StyleClassTest from '@/components/styleClassTest/StyleClassTest.vue'
import ListTest from '@/components/listTest/ListTest.vue'
import FormTest from '@/components/formTest/FormTest.vue'

const hasError = ref<boolean>(false)
const errorBoundaryRef = ref()
const clickCount = ref<number>(0)
const welcomeProps = reactive<{ msg: string; description: string }>({
  msg: 'Hello',
  description: 'This is a description!!!',
})

const triggerError = () => {
  hasError.value = !hasError.value
  errorBoundaryRef.value?.reset()
  clickCount.value += 1
}

const rawHtml = `<span style="color: red; font-weight: bold;">This is raw HTML content.</span>`
</script>

<style scoped lang="scss">
.even {
  background-color: yellow;
}
.odd {
  background-color: blue;
  color: white;
}
</style>
