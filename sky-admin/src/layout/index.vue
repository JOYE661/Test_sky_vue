<template>
  <div class="app-wrapper">
    <div class="sidebar-container">
      <div class="logo-container">
          <h1 class="sidebar-title">Somago</h1>
      </div>
      <el-scrollbar>
        <Sidebar />
      </el-scrollbar>
    </div>
    <div class="main-container">
      <Navbar />
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar.vue'
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
}
.sidebar-container {
  width: 210px;
  background-color: #304156;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width 0.28s;
}
.logo-container {
    height: 50px;
    line-height: 50px;
    background: #2b2f3a;
    text-align: center;
    overflow: hidden;
}
.sidebar-title {
    display: inline-block;
    margin: 0;
    color: #fff;
    font-weight: 600;
    line-height: 50px;
    font-size: 14px;
    font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    vertical-align: middle;
}
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.navbar {
    height: 50px;
    border-bottom: 1px solid #d8dce5;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,21,41,.08);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-right: 20px;
}
.app-main {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
    background-color: #f0f2f5; 
}
</style>