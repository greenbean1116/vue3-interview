<!-- 建立 Layout.vue：
- 命名 slot：header、sidebar、main、footer
- 預設內容：如果沒傳入，顯示對應的佔位文字
父組件：
- 填入 header 和 main，sidebar 不填（觀察預設內容） -->

<template lang="">
  <div>
    <Layout>
      <template #header>
        <h2>header</h2>
      </template>
      <template #main> <h2>main</h2></template>
      <!-- <template #sider> <h2>sider</h2></template> -->
      <template #footer> <h2>footer</h2></template>
    </Layout>
  </div>
</template>
<script setup lang="ts">
import Layout from './Layout.vue'
</script>
<style lang=""></style>
