<template lang="">
  <div>theme: {{ theme }}</div>
  <button @click="toggleTheme">toggle theme</button>
</template>
<script setup lang="ts">
import { inject } from 'vue'
import type { IStore } from './types'

const { theme, toggleTheme } = inject<IStore>('store')!
</script>
<style lang=""></style>
