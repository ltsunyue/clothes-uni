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

      <view class="upload" @tap="chooseImage">
        <image v-if="imagePath" class="preview" :src="imagePath" mode="aspectFill" />
        <view v-else class="empty-preview">选择衣物图片</view>
      </view>

      <button class="primary" @tap="saveItem">保存衣物</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CATEGORY_TREE, addWardrobeItem } from '../../utils/storage'

const categoryIndex = ref(0)
const subcategoryIndex = ref(0)
const imagePath = ref('')

const categoryLabels = computed(() => CATEGORY_TREE.map((item) => item.label))
const activeCategory = computed(() => CATEGORY_TREE[categoryIndex.value])
const subcategoryLabels = computed(() => activeCategory.value.children.map((item) => item.label))
const activeSubcategory = computed(() => activeCategory.value.children[subcategoryIndex.value])

function onCategoryChange(event) {
  categoryIndex.value = Number(event.detail.value)
  subcategoryIndex.value = 0
}

function onSubcategoryChange(event) {
  subcategoryIndex.value = Number(event.detail.value)
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
  uni.showToast({ title: '已保存', icon: 'success' })
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

.upload {
  height: 520rpx;
  border: 2rpx dashed #8fb7ae;
  border-radius: 8px;
  overflow: hidden;
}

.preview {
  width: 100%;
  height: 100%;
}

.empty-preview {
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
</style>
