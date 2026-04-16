<template>
  <view class="page">
    <view class="toolbar">
      <view class="filter" :class="{ active: currentFilter === 'all' }" @tap="currentFilter = 'all'">全部</view>
      <view
        v-for="category in CATEGORY_TREE"
        :key="category.key"
        class="filter"
        :class="{ active: currentFilter === category.key }"
        @tap="currentFilter = category.key"
      >
        {{ category.label }}
      </view>
    </view>

    <view class="list">
      <view v-if="filteredItems.length === 0" class="empty-state">还没有保存衣物，先去上传一件吧。</view>
      <view v-for="item in filteredItems" :key="item.id" class="cloth-card">
        <image class="cloth-image" :src="item.image" mode="aspectFill" />
        <view class="cloth-info">
          <text class="cloth-title">{{ labelOf(item.category, item.subcategory) }}</text>
          <text class="cloth-meta">{{ formatTime(item.createdAt) }}</text>
        </view>
        <button class="delete" size="mini" @tap="removeItem(item.id)">删除</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  CATEGORY_TREE,
  deleteWardrobeItem,
  getSubcategoryLabel,
  getWardrobeItems
} from '../../utils/storage'

const items = ref([])
const currentFilter = ref('all')

const filteredItems = computed(() => {
  if (currentFilter.value === 'all') {
    return items.value
  }
  return items.value.filter((item) => item.category === currentFilter.value)
})

onShow(() => {
  items.value = getWardrobeItems()
})

function removeItem(id) {
  uni.showModal({
    title: '删除衣物',
    content: '确认删除这件衣物吗？',
    success: (result) => {
      if (result.confirm) {
        deleteWardrobeItem(id)
        items.value = getWardrobeItems()
      }
    }
  })
}

function labelOf(category, subcategory) {
  return getSubcategoryLabel(category, subcategory)
}

function formatTime(time) {
  return new Date(time).toLocaleDateString()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 18rpx;
  overflow-x: auto;
}

.filter {
  flex: 0 0 auto;
  padding: 14rpx 24rpx;
  color: #3b4542;
  background: #ffffff;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
  font-size: 26rpx;
}

.filter.active {
  color: #ffffff;
  background: #156b6a;
  border-color: #156b6a;
}

.list {
  display: grid;
  gap: 18rpx;
}

.empty-state {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #69736f;
  background: #ffffff;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
  font-size: 28rpx;
}

.cloth-card {
  display: grid;
  grid-template-columns: 132rpx 1fr 120rpx;
  align-items: center;
  gap: 18rpx;
  min-height: 132rpx;
  padding: 16rpx;
  background: #ffffff;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
}

.cloth-image {
  width: 132rpx;
  height: 132rpx;
  border-radius: 8px;
  background: #e7ece9;
}

.cloth-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.cloth-title {
  color: #222;
  font-size: 30rpx;
  font-weight: 600;
}

.cloth-meta {
  color: #69736f;
  font-size: 24rpx;
}

.delete {
  color: #ffffff;
  background: #d94f45;
}
</style>
