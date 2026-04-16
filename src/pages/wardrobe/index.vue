<template>
  <view class="page">
    <view class="panel form-panel">
      <view class="field choice-field">
        <text class="label">分类</text>
        <radio-group class="choice-group" @change="onCategoryRadioChange">
          <label
            v-for="(category, index) in CATEGORY_TREE"
            :key="category.key"
            class="choice"
            :class="{ active: activeCategory.key === category.key }"
          >
            <radio class="radio" :value="category.key" :checked="categoryIndex === index" color="#156b6a" />
            {{ category.label }}
          </label>
        </radio-group>
      </view>

      <view class="field choice-field">
        <text class="label">类型</text>
        <radio-group class="choice-group" @change="onSubcategoryRadioChange">
          <label
            v-for="(subcategory, index) in activeCategory.children"
            :key="subcategory.key"
            class="choice"
            :class="{ active: activeSubcategory.key === subcategory.key }"
          >
            <radio class="radio" :value="subcategory.key" :checked="subcategoryIndex === index" color="#156b6a" />
            {{ subcategory.label }}
          </label>
        </radio-group>
      </view>

      <view class="upload" @tap="chooseImage">
        <image v-if="imagePath" class="preview" :src="imagePath" mode="aspectFill" />
        <view v-else class="empty-preview">选择衣物图片</view>
      </view>

      <button class="primary" @tap="saveItem">保存到分类</button>
    </view>

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
      <view v-if="filteredItems.length === 0" class="empty-state">还没有保存衣物，先上传一件吧。</view>
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
  addWardrobeItem,
  deleteWardrobeItem,
  getSubcategoryLabel,
  getWardrobeItems
} from '../../utils/storage'

const items = ref([])
const categoryIndex = ref(0)
const subcategoryIndex = ref(0)
const imagePath = ref('')
const currentFilter = ref('all')

const activeCategory = computed(() => CATEGORY_TREE[categoryIndex.value])
const activeSubcategory = computed(() => activeCategory.value.children[subcategoryIndex.value])
const filteredItems = computed(() => {
  if (currentFilter.value === 'all') {
    return items.value
  }
  return items.value.filter((item) => item.category === currentFilter.value)
})

onShow(() => {
  items.value = getWardrobeItems()
})

function selectCategory(index) {
  categoryIndex.value = index
  subcategoryIndex.value = 0
}

function onCategoryRadioChange(event) {
  const index = CATEGORY_TREE.findIndex((category) => category.key === event.detail.value)
  if (index >= 0) {
    selectCategory(index)
  }
}

function onSubcategoryRadioChange(event) {
  const index = activeCategory.value.children.findIndex((subcategory) => subcategory.key === event.detail.value)
  if (index >= 0) {
    subcategoryIndex.value = index
  }
}

function chooseImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (result) => {
      imagePath.value = result.tempFilePaths[0]
    }
  })
}

function saveItem() {
  if (!imagePath.value) {
    uni.showToast({ title: '请先选择图片', icon: 'none' })
    return
  }

  uni.saveFile({
    tempFilePath: imagePath.value,
    success: (result) => {
      createItem(result.savedFilePath)
    },
    fail: () => {
      createItem(imagePath.value)
    }
  })
}

function createItem(image) {
  addWardrobeItem({
    category: activeCategory.value.key,
    subcategory: activeSubcategory.value.key,
    image
  })
  imagePath.value = ''
  items.value = getWardrobeItems()
  uni.showToast({ title: '已保存', icon: 'success' })
}

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

.panel {
  background: #ffffff;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
  padding: 24rpx;
}

.form-panel {
  display: grid;
  gap: 20rpx;
}

.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.choice-field {
  align-items: flex-start;
  flex-direction: column;
  gap: 14rpx;
}

.label {
  color: #3b4542;
  font-size: 28rpx;
}

.choice-group {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  width: 100%;
}

.choice {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 156rpx;
  min-height: 68rpx;
  padding: 0 18rpx;
  box-sizing: border-box;
  color: #3b4542;
  background: #f4f6f5;
  border: 2rpx solid #dce4df;
  border-radius: 8px;
  font-size: 28rpx;
}

.choice.active {
  color: #156b6a;
  background: #eef7f6;
  border-color: #156b6a;
  font-weight: 600;
}

.radio {
  transform: scale(0.82);
}

.upload {
  height: 300rpx;
  border: 2rpx dashed #8fb7ae;
  border-radius: 8px;
  overflow: hidden;
}

.preview,
.cloth-image {
  width: 100%;
  height: 100%;
}

.empty-preview,
.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #69736f;
  font-size: 28rpx;
}

.primary {
  height: 84rpx;
  line-height: 84rpx;
  color: #ffffff;
  background: #156b6a;
  font-size: 30rpx;
}

.toolbar {
  display: flex;
  gap: 16rpx;
  margin: 28rpx 0 16rpx;
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
