<template lang="">
  <div>
    <TreeItem :treeData="treeData" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import TreeItem from './TreeItem.vue'
import type { ITreeData } from './types'

const treeData = ref<ITreeData>({
  name: 'My Tree',
  children: [
    { name: 'hello' },
    { name: 'world' },
    {
      name: 'child folder',
      children: [
        {
          name: 'child folder',
          children: [{ name: 'hello' }, { name: 'world' }],
        },
        { name: 'hello' },
        { name: 'world' },
        {
          name: 'child folder',
          children: [{ name: 'hello' }, { name: 'world' }],
        },
      ],
    },
  ],
})
</script>
<style lang=""></style>
