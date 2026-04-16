<template>
  <view class="page">
    <view class="header">
      <text class="title">我的</text>
      <text class="subtitle">管理衣物和已保存的搭配方案</text>
    </view>

    <view class="menu">
      <button class="menu-button" @tap="goUploadClothes">上传衣物</button>
      <button class="menu-button" @tap="goSavedClothes">我的衣物</button>
      <button class="menu-button" @tap="goPlans">我的穿搭</button>
    </view>
  </view>
</template>

<script setup>
function goUploadClothes() {
  uni.navigateTo({
    url: '/pages/upload-clothes/index'
  })
}

function goSavedClothes() {
  uni.navigateTo({
    url: '/pages/my-clothes/index',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}

function goPlans() {
  uni.navigateTo({
    url: '/pages/plans/index',
    fail: () => {
      uni.showToast({ title: '页面打开失败', icon: 'none' })
    }
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 40rpx 24rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-bottom: 32rpx;
}

.title {
  color: #222;
  font-size: 42rpx;
  font-weight: 800;
}

.subtitle {
  color: #69736f;
  font-size: 28rpx;
}

.menu {
  display: grid;
  gap: 20rpx;
  width: 100%;
}

.menu-button {
  width: 100%;
  box-sizing: border-box;
  height: 96rpx;
  line-height: 96rpx;
  color: #ffffff;
  background: #156b6a;
  font-size: 30rpx;
  text-align: center;
}
</style>
