<template>
  <view class="page">
    <view v-if="plans.length === 0" class="empty">还没有保存搭配方案。</view>

    <view v-for="plan in plans" :key="plan.id" class="plan-card">
      <view class="plan-header">
        <view class="plan-title-box">
          <text class="plan-title">{{ plan.name }}</text>
          <text class="plan-time">{{ formatTime(plan.createdAt) }}</text>
        </view>
        <view class="plan-actions">
          <button class="rename" size="mini" @tap="renamePlan(plan)">修改</button>
          <button class="delete" size="mini" @tap="removePlan(plan.id)">删除</button>
        </view>
      </view>

      <view class="plan-preview">
        <view class="person">
          <view class="head">
            <view class="hair"></view>
            <view class="eye eye-left"></view>
            <view class="eye eye-right"></view>
            <view class="nose"></view>
            <view class="mouth"></view>
          </view>
          <view class="neck"></view>
          <view class="torso">
            <view class="arm arm-left"></view>
            <view class="arm arm-right"></view>
            <view class="body"></view>
          </view>
          <view class="legs">
            <view class="leg leg-left"></view>
            <view class="leg leg-right"></view>
          </view>
          <view class="feet">
            <view class="foot"></view>
            <view class="foot"></view>
          </view>
        </view>

        <image
          v-if="plan.items.clothes"
          class="wear wear-top"
          :class="{ moved: hasMoved(plan, 'clothes') }"
          :style="wearStyle(plan, 'clothes')"
          :src="plan.items.clothes.image"
          mode="aspectFit"
        />
        <image
          v-if="plan.items.pants"
          class="wear wear-pants"
          :class="{ moved: hasMoved(plan, 'pants') }"
          :style="wearStyle(plan, 'pants')"
          :src="plan.items.pants.image"
          mode="aspectFit"
        />
        <image
          v-if="plan.items.shoes"
          class="wear wear-shoes"
          :class="{ moved: hasMoved(plan, 'shoes') }"
          :style="wearStyle(plan, 'shoes')"
          :src="plan.items.shoes.image"
          mode="aspectFit"
        />
      </view>

      <view class="picked-list">
        <view v-for="slot in slots" :key="slot.key" class="picked-item">
          <text class="picked-label">{{ slot.label }}</text>
          <text class="picked-name">{{ plan.items[slot.key] ? subLabel(plan.items[slot.key]) : '未选择' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { deleteOutfitPlan, getOutfitPlans, getSubcategoryLabel, updateOutfitPlanName } from '../../utils/storage'

const plans = ref([])
const slots = [
  { key: 'clothes', label: '衣服' },
  { key: 'pants', label: '裤子' },
  { key: 'shoes', label: '鞋' }
]

onShow(() => {
  plans.value = getOutfitPlans()
})

function removePlan(id) {
  uni.showModal({
    title: '删除方案',
    content: '确认删除这个搭配方案吗？',
    success: (result) => {
      if (result.confirm) {
        deleteOutfitPlan(id)
        plans.value = getOutfitPlans()
      }
    }
  })
}

function renamePlan(plan) {
  uni.showModal({
    title: '修改方案名称',
    editable: true,
    placeholderText: '请输入方案名称',
    content: plan.name,
    success: (result) => {
      if (!result.confirm) {
        return
      }
      const nextName = (result.content || '').trim()
      if (!nextName) {
        uni.showToast({ title: '名称不能为空', icon: 'none' })
        return
      }
      updateOutfitPlanName(plan.id, nextName)
      plans.value = getOutfitPlans()
      uni.showToast({ title: '已修改', icon: 'success' })
    }
  })
}

function subLabel(item) {
  return getSubcategoryLabel(item.category, item.subcategory)
}

function formatTime(time) {
  return new Date(time).toLocaleString()
}

function hasMoved(plan, slot) {
  return Boolean(plan.positions?.[slot]?.moved)
}

function wearStyle(plan, slot) {
  const position = plan.positions?.[slot]
  if (!position?.moved) {
    return `transform:translateX(-50%) ${wearTransform(position)};`
  }
  const left = clampRate(position.xRate) * 100
  const top = clampRate(position.yRate) * 100
  const width = clampSizeRate(position.widthRate) * 100
  const height = clampSizeRate(position.heightRate) * 100
  return `left:${left}%;top:${top}%;width:${width}%;height:${height}%;transform:${wearTransform(position)};`
}

function clampRate(value) {
  if (typeof value !== 'number') {
    return 0
  }
  return Math.min(Math.max(value, 0), 1)
}

function clampSizeRate(value) {
  if (typeof value !== 'number' || value <= 0) {
    return 0.45
  }
  return Math.min(Math.max(value, 0.12), 1)
}

function wearTransform(position) {
  const scale = typeof position?.scale === 'number' ? position.scale : 1
  const rotate = typeof position?.rotate === 'number' ? position.rotate : 0
  return `scale(${scale}) rotate(${rotate}deg)`
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.empty {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #69736f;
  background: #ffffff;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
  font-size: 28rpx;
}

.plan-card {
  margin-bottom: 22rpx;
  padding: 22rpx;
  background: #ffffff;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
}

.plan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.plan-title-box {
  min-width: 0;
  flex: 1;
}

.plan-title,
.plan-time {
  display: block;
}

.plan-title {
  color: #222;
  font-size: 30rpx;
  font-weight: 700;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-time {
  margin-top: 8rpx;
  color: #69736f;
  font-size: 24rpx;
}

.delete {
  color: #ffffff;
  background: #d94f45;
}

.plan-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 10rpx;
}

.rename {
  color: #ffffff;
  background: #156b6a;
}

.plan-preview {
  position: relative;
  width: 452rpx;
  height: 820rpx;
  margin-bottom: 18rpx;
  margin-left: auto;
  margin-right: auto;
  background: #f4f6f5;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
  overflow: hidden;
}

.person {
  position: absolute;
  left: 50%;
  top: 62rpx;
  transform: translateX(-50%);
  width: 300rpx;
  height: 680rpx;
}

.head {
  position: relative;
  z-index: 2;
  width: 116rpx;
  height: 116rpx;
  margin: 0 auto;
  background: #ffd7b5;
  border: 4rpx solid #2f3533;
  border-radius: 58rpx;
  overflow: hidden;
}

.hair {
  position: absolute;
  left: -8rpx;
  top: -12rpx;
  width: 132rpx;
  height: 46rpx;
  background: #2f3533;
  border-radius: 42rpx 42rpx 22rpx 22rpx;
}

.eye {
  position: absolute;
  top: 52rpx;
  width: 10rpx;
  height: 10rpx;
  background: #2f3533;
  border-radius: 50%;
}

.eye-left {
  left: 34rpx;
}

.eye-right {
  right: 34rpx;
}

.nose {
  position: absolute;
  left: 52rpx;
  top: 62rpx;
  width: 12rpx;
  height: 18rpx;
  border-right: 3rpx solid #c68f72;
  border-bottom: 3rpx solid #c68f72;
  border-radius: 0 0 8rpx 0;
}

.mouth {
  position: absolute;
  left: 42rpx;
  top: 86rpx;
  width: 32rpx;
  height: 14rpx;
  border-bottom: 4rpx solid #a55b5b;
  border-radius: 0 0 24rpx 24rpx;
}

.neck {
  position: relative;
  z-index: 1;
  width: 42rpx;
  height: 34rpx;
  margin: -4rpx auto 0;
  background: #f0c2a4;
  border-left: 4rpx solid #2f3533;
  border-right: 4rpx solid #2f3533;
}

.torso {
  position: relative;
  width: 240rpx;
  height: 268rpx;
  margin: -2rpx auto 0;
}

.body {
  position: relative;
  z-index: 1;
  width: 170rpx;
  height: 250rpx;
  margin: 0 auto;
  background: #dce4df;
  border: 4rpx solid #2f3533;
  border-radius: 42rpx 42rpx 18rpx 18rpx;
}

.arm {
  position: absolute;
  top: 20rpx;
  width: 42rpx;
  height: 228rpx;
  background: #f0c2a4;
  border: 4rpx solid #2f3533;
  border-radius: 28rpx;
}

.arm-left {
  left: 0;
  transform: rotate(8deg);
}

.arm-right {
  right: 0;
  transform: rotate(-8deg);
}

.legs {
  display: flex;
  justify-content: center;
  gap: 22rpx;
  width: 170rpx;
  height: 224rpx;
  margin: 8rpx auto 0;
}

.leg {
  width: 54rpx;
  height: 224rpx;
  background: #a6b3ad;
  border: 4rpx solid #2f3533;
  border-radius: 18rpx 18rpx 24rpx 24rpx;
}

.feet {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-top: -4rpx;
}

.foot {
  width: 70rpx;
  height: 28rpx;
  background: #2f3533;
  border-radius: 28rpx 28rpx 12rpx 12rpx;
}

.wear {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.wear.moved {
  left: 0;
  transform: none;
}

.wear-top {
  top: 198rpx;
  width: 230rpx;
  height: 210rpx;
}

.wear-pants {
  top: 388rpx;
  width: 220rpx;
  height: 220rpx;
}

.wear-shoes {
  top: 618rpx;
  width: 250rpx;
  height: 120rpx;
}

.picked-list {
  display: grid;
  gap: 12rpx;
}

.picked-item {
  display: grid;
  grid-template-columns: 92rpx 1fr;
  gap: 12rpx;
  align-items: center;
  min-height: 56rpx;
  padding: 0 16rpx;
  background: #f4f6f5;
  border-radius: 8px;
}

.picked-label {
  color: #69736f;
  font-size: 24rpx;
}

.picked-name {
  color: #3b4542;
  font-size: 24rpx;
}
</style>
