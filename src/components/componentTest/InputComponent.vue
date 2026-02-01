<template lang="">
  <div>
    <input v-model="inputValue" v-focus placeholder="Enter text" />
  </div>
  <teleport to=".about"> <div class="shouldBeAbout">should be about</div></teleport>
</template>
<script setup lang="ts">
import { ref, onUpdated } from 'vue'

const inputValue = ref('')
onUpdated(() => {
  console.log('vvvvvv')
})

const vFocus = {
  created: (el: HTMLInputElement) => {
    console.log('尚未掛載', el)
  },
  mounted: (el: HTMLInputElement) => {
    console.log('已掛載', el)
    el.focus()
  },
}
</script>
<style lang=""></style>
