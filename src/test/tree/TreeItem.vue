<template lang="">
  <ul>
    <li
      :class="['treeItem', isFolder ? 'folderItem' : '']"
      @click="handleOpen"
      @dblclick="handleChangeToFolder"
    >
      {{ treeData.name }} {{ isFolder ? `${isOpen ? '[-]' : '[+]'}` : '' }}
    </li>
    <div v-if="isFolder && isOpen">
      <div v-for="item in treeData.children" :key="index">
        <TreeItem :treeData="item" />
      </div>
    </div>
    <ul class="treeItem" v-if="isFolder && isOpen">
      <li @click="handleAddItem">+</li>
    </ul>
  </ul>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ITreeData } from './types'
const props = defineProps<{ treeData: ITreeData }>()
const { treeData } = props

const isOpen = ref(false)
const isFolder = computed(() => {
  if (treeData.children) {
    return treeData.children?.length > 0
  }
  return false
})
const handleAddItem = () => {
  treeData.children?.push({ name: 'new stuff' })
}
const handleOpen = () => {
  if (isFolder.value) {
    isOpen.value = !isOpen.value
  }
}
const handleChangeToFolder = () => {
  treeData.children = [{ name: 'new stuff' }]
}
</script>
<style lang="scss">
.treeItem {
  cursor: pointer;
}
.folderItem {
  font-weight: bold;
}
</style>
