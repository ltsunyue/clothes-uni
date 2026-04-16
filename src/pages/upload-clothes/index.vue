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
        <radio-group class="choice-group type-choice-group" @change="onSubcategoryRadioChange">
          <label
            v-for="(subcategory, index) in activeCategory.children"
            :key="subcategory.key"
            class="choice"
            :class="{ active: activeSubcategory.key === subcategory.key }"
          >
            <radio class="radio" :value="subcategory.key" :checked="subcategoryIndex === index" color="#629a8d" />
            {{ subcategory.label }}
          </label>
        </radio-group>
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

const activeCategory = computed(() => CATEGORY_TREE[categoryIndex.value])
const activeSubcategory = computed(() => activeCategory.value.children[subcategoryIndex.value])

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

.type-choice-group .choice {
  min-width: 151rpx;
  min-height: 63rpx;
  padding: 0 13rpx;
  color: #56615d;
  background: #fbfcfb;
  border-color: #e7eeea;
  font-size: 27rpx;
}

.type-choice-group .choice.active {
  color: #2b7774;
  background: #f2faf8;
  border-color: #8fc9c2;
}

.radio {
  transform: scale(0.82);
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
