<script setup lang="ts">
</script>

<template>
  <div class="app-wrapper">
    <router-view />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f7f8fa;
}

/* PC 适配 */
@media screen and (min-width: 600px) {
  body {
    background-color: #eef0f4;
    display: flex;
    justify-content: center;
  }

  #app {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .app-wrapper {
    width: 100%;
    max-width: 480px; /* 模拟大屏手机宽度 */
    min-height: 100vh;
    background-color: #fff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    position: relative;
    /* 
      关键：为了让 fixed 元素（如底部导航）能相对于这个容器定位，
      通常 fixed 是相对于视口的。
      但在 transform 不为 none 的元素内，fixed 会降级为 absolute。
      或者我们手动限制 fixed 元素的宽度。
    */
  }

  /* 
    暴力适配 Vant 的 fixed 元素 
    注意：这需要针对具体组件类名进行调整
  */
  .van-nav-bar--fixed,
  .van-tabbar--fixed,
  .cart-bar {
    max-width: 480px;
    left: 50% !important;
    transform: translateX(-50%);
  }
  
  /* 修复 Tabbar placeholder 的问题 */
  .van-tabbar-item {
    font-size: 12px;
  }
}
</style>
