<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'

const router = useRouter()
const userId = ref('')
const userName = ref('')
const userAvatar = ref('')
const token = ref('')

onMounted(() => {
  userId.value = localStorage.getItem('userId') || 'Guest'
  userName.value = localStorage.getItem('userName') || `用户 ${userId.value}`
  userAvatar.value = localStorage.getItem('userAvatar') || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
  token.value = localStorage.getItem('token') || ''
  
  if (!token.value) {
    router.push('/login')
  }
})

const onLogout = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认退出登录吗？'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userAvatar')
    router.replace('/login')
  }).catch(() => {})
}

const navToOrders = (status: number) => {
  router.push({ path: '/orders', query: { status } })
}
</script>

<template>
  <div class="user-container">
    <div class="user-header">
      <div class="avatar">
        <van-image
          round
          width="60"
          height="60"
          :src="userAvatar"
        />
      </div>
      <div class="info">
        <div class="name">{{ userName }}</div>
        <div class="desc">欢迎回到苍穹外卖</div>
      </div>
    </div>

    <div class="order-panel">
      <div class="panel-header" @click="router.push('/orders')">
        <span>我的订单</span>
        <van-icon name="arrow" color="#999" />
      </div>
      <van-grid :border="false">
        <van-grid-item icon="pending-payment" text="待付款" @click="navToOrders(1)" />
        <van-grid-item icon="todo-list-o" text="待接单" @click="navToOrders(2)" />
        <van-grid-item icon="logistics" text="派送中" @click="navToOrders(4)" />
        <van-grid-item icon="completed" text="已完成" @click="navToOrders(5)" />
      </van-grid>
    </div>

    <div class="func-group">
      <van-cell title="地址管理" is-link to="/address" icon="location-o" />
      <van-cell title="联系客服" is-link icon="service-o" />
      <van-cell title="退出登录" is-link @click="onLogout" icon="close" />
    </div>

    <van-tabbar route fixed placeholder z-index="9">
      <van-tabbar-item icon="home-o" to="/home">点餐</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/orders">订单</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/me">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped lang="scss">
.user-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 50px;
}

.user-header {
  background-color: #ffc200;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  
  .avatar {
    margin-right: 15px;
    border: 2px solid #fff;
    border-radius: 50%;
  }
  
  .info {
    color: #333;
    .name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .desc {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.order-panel {
  margin: 10px;
  background: #fff;
  border-radius: 8px;
  padding: 10px 0;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    padding: 0 15px 10px;
    font-size: 14px;
    font-weight: bold;
    border-bottom: 1px solid #f5f5f5;
  }
}

.func-group {
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
