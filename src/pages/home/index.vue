<template>
  <view class="page">
    <view class="welcome">
      <text class="eyebrow">今日穿搭</text>
      <text class="title">整理衣物，快速完成一套搭配</text>
      <text class="desc">把常穿单品放进衣物库，在搭配里试穿组合，喜欢的方案随时保存。</text>
    </view>

    <view class="actions">
      <button class="primary" @tap="goOutfit">开始搭配</button>
      <button class="secondary" @tap="goProfile">进入我的</button>
    </view>
  </view>
</template>

<script setup>
function goOutfit() {
  uni.switchTab({
    url: '/pages/outfit/index'
  })
}

function goProfile() {
  uni.switchTab({
    url: '/pages/profile/index'
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
}

.welcome {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding-top: 72rpx;
}

.eyebrow {
  color: #156b6a;
  font-size: 28rpx;
  font-weight: 700;
}

.title {
  color: #222;
  font-size: 48rpx;
  font-weight: 800;
  line-height: 1.25;
}

.desc {
  color: #69736f;
  font-size: 30rpx;
  line-height: 1.7;
}

.actions {
  display: grid;
  gap: 20rpx;
  margin-top: 64rpx;
}

.primary,
.secondary {
  height: 88rpx;
  line-height: 88rpx;
  font-size: 30rpx;
}

.primary {
  color: #ffffff;
  background: #156b6a;
}

.secondary {
  color: #156b6a;
  background: #eef7f6;
}
</style>
