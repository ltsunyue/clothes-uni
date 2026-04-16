<template>
  <view class="page">
    <view class="panel form-panel">
      <view class="field">
        <text class="label">分类</text>
        <picker :range="categoryLabels" :value="categoryIndex" @change="onCategoryChange">
          <view class="picker">{{ activeCategory.label }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">类型</text>
        <picker :range="subcategoryLabels" :value="subcategoryIndex" @change="onSubcategoryChange">
          <view class="picker">{{ activeSubcategory.label }}</view>
        </picker>
      </view>

      <view class="current">
        <text class="current-label">当前默认分类</text>
        <text class="current-value">{{ activeCategory.label }} / {{ activeSubcategory.label }}</text>
      </view>

      <button class="primary" @tap="saveCategory">保存分类</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  CATEGORY_TREE,
  getDefaultClothesCategory,
  saveDefaultClothesCategory
} from '../../utils/storage'

const defaultCategory = getDefaultClothesCategory()
const initialCategoryIndex = CATEGORY_TREE.findIndex((item) => item.key === defaultCategory.category)
const categoryIndex = ref(Math.max(initialCategoryIndex, 0))
const subcategoryIndex = ref(getInitialSubcategoryIndex())

const categoryLabels = computed(() => CATEGORY_TREE.map((item) => item.label))
const activeCategory = computed(() => CATEGORY_TREE[categoryIndex.value])
const subcategoryLabels = computed(() => activeCategory.value.children.map((item) => item.label))
const activeSubcategory = computed(() => activeCategory.value.children[subcategoryIndex.value])

function getInitialSubcategoryIndex() {
  const category = CATEGORY_TREE[Math.max(initialCategoryIndex, 0)]
  const index = category.children.findIndex((item) => item.key === defaultCategory.subcategory)
  return Math.max(index, 0)
}

function onCategoryChange(event) {
  categoryIndex.value = Number(event.detail.value)
  subcategoryIndex.value = 0
}

function onSubcategoryChange(event) {
  subcategoryIndex.value = Number(event.detail.value)
}

function saveCategory() {
  saveDefaultClothesCategory({
    category: activeCategory.value.key,
    subcategory: activeSubcategory.value.key
  })
  uni.showToast({ title: '分类已保存', icon: 'success' })
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

.label {
  color: #3b4542;
  font-size: 28rpx;
}

.picker {
  min-width: 260rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  color: #156b6a;
  background: #eef7f6;
  border-radius: 8px;
  font-size: 28rpx;
}

.current {
  display: grid;
  gap: 10rpx;
  padding: 24rpx;
  background: #f4f6f5;
  border-radius: 8px;
}

.current-label {
  color: #69736f;
  font-size: 26rpx;
}

.current-value {
  color: #222;
  font-size: 32rpx;
  font-weight: 700;
}

.primary {
  height: 84rpx;
  line-height: 84rpx;
  color: #ffffff;
  background: #156b6a;
  font-size: 30rpx;
}
</style>
