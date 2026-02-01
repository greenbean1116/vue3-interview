<template lang="">
  <div :class="[$attrs.class, 'childMargin']" :style="$attrs.style">child1</div>
  <div :class="['childMargin', computedClass]">child2</div>
  <div class="childMargin" v-if="count % 2 === 0">child3</div>
  <div class="childMargin" v-show="count % 2 === 0">child4</div>
  <button @click="count++">click me {{ count }}</button>
</template>
<script setup lang="ts">
import { ref, watchEffect, useAttrs, computed } from 'vue'
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()
const count = ref(0)

watchEffect(() => {
  console.log('attrs change!!!', { ...attrs })
})

const computedClass = computed(() => {
  return count.value % 2 === 0 ? 'even-child' : 'odd-child'
})
</script>
<style scoped lang="scss">
.active {
  border: 2px solid red;
}
.danger {
  background-color: green;
  color: white;
}
.childMargin {
  margin-top: 10px;
}
.even-child {
  background-color: gray;
}
.odd-child {
  background-color: orangered;
}
</style>
