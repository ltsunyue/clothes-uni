<template>
  <view class="page">
    <view class="summary">
      <text>点击左侧衣物直接穿上，也可以向右拖到搭配区域。</text>
    </view>

    <view class="stage">
      <view class="left-panel">
        <scroll-view class="cloth-scroll" scroll-y>
          <view v-for="category in CATEGORY_TREE" :key="category.key" class="category-section">
            <view class="category-title">{{ category.label }}</view>
            <view v-if="itemsByCategory[category.key].length === 0" class="empty">暂无{{ category.label }}</view>
            <view
              v-for="item in itemsByCategory[category.key]"
              :key="item.id"
              class="draggable-item"
              @tap="equip(item)"
              @touchstart="startSourceDrag(item, $event)"
              @touchmove="moveSourceDrag"
              @touchend="endSourceDrag"
              @touchcancel="cancelSourceDrag"
            >
              <image class="thumb" :src="item.image" mode="aspectFill" />
              <text class="item-name">{{ subLabel(item) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view id="personZone" class="person-zone">
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

        <view
          v-if="selected.clothes"
          id="wear-clothes"
          class="wear-box wear-top"
          :class="{ active: activeSlot === 'clothes', moved: wearPositions.clothes.moved }"
          :style="wearStyle('clothes')"
          @touchstart.stop="startWearDrag('clothes', $event)"
          @touchmove.stop.prevent="moveWearDrag"
          @touchend.stop="endWearDrag($event)"
          @touchcancel.stop="cancelWearDrag"
        >
          <image class="wear-image" :src="selected.clothes.image" mode="aspectFit" />
          <view v-if="activeSlot === 'clothes'" class="wear-frame">
            <view class="corner corner-left-top"></view>
            <view class="corner corner-left-bottom"></view>
            <view
              class="corner corner-right-bottom adjust-handle"
              @touchstart.stop="startTransformDrag('clothes', $event)"
              @touchmove.stop.prevent="moveTransformDrag"
              @touchend.stop="endTransformDrag"
              @touchcancel.stop="endTransformDrag"
            >
              调
            </view>
          </view>
        </view>
        <view
          v-if="selected.pants"
          id="wear-pants"
          class="wear-box wear-pants"
          :class="{ active: activeSlot === 'pants', moved: wearPositions.pants.moved }"
          :style="wearStyle('pants')"
          @touchstart.stop="startWearDrag('pants', $event)"
          @touchmove.stop.prevent="moveWearDrag"
          @touchend.stop="endWearDrag($event)"
          @touchcancel.stop="cancelWearDrag"
        >
          <image class="wear-image" :src="selected.pants.image" mode="aspectFit" />
          <view v-if="activeSlot === 'pants'" class="wear-frame">
            <view class="corner corner-left-top"></view>
            <view class="corner corner-left-bottom"></view>
            <view
              class="corner corner-right-bottom adjust-handle"
              @touchstart.stop="startTransformDrag('pants', $event)"
              @touchmove.stop.prevent="moveTransformDrag"
              @touchend.stop="endTransformDrag"
              @touchcancel.stop="endTransformDrag"
            >
              调
            </view>
          </view>
        </view>
        <view
          v-if="selected.shoes"
          id="wear-shoes"
          class="wear-box wear-shoes"
          :class="{ active: activeSlot === 'shoes', moved: wearPositions.shoes.moved }"
          :style="wearStyle('shoes')"
          @touchstart.stop="startWearDrag('shoes', $event)"
          @touchmove.stop.prevent="moveWearDrag"
          @touchend.stop="endWearDrag($event)"
          @touchcancel.stop="cancelWearDrag"
        >
          <image class="wear-image" :src="selected.shoes.image" mode="aspectFit" />
          <view v-if="activeSlot === 'shoes'" class="wear-frame">
            <view class="corner corner-left-top"></view>
            <view class="corner corner-left-bottom"></view>
            <view
              class="corner corner-right-bottom adjust-handle"
              @touchstart.stop="startTransformDrag('shoes', $event)"
              @touchmove.stop.prevent="moveTransformDrag"
              @touchend.stop="endTransformDrag"
              @touchcancel.stop="endTransformDrag"
            >
              调
            </view>
          </view>
        </view>

        <view class="drop-hint">搭配区域</view>
      </view>
    </view>

    <view v-if="draggingItem" class="drag-ghost" :style="ghostStyle">
      <image class="ghost-image" :src="draggingItem.image" mode="aspectFill" />
    </view>

    <view class="actions">
      <button class="primary" @tap="savePlan">保存搭配方案</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { CATEGORY_TREE, addOutfitPlan, getSubcategoryLabel, getWardrobeItems } from '../../utils/storage'

const items = ref([])
const activeSlot = ref('')
const draggingItem = ref(null)
const dragCandidate = ref(null)
const dragPoint = ref({ x: 0, y: 0 })
const dragStartPoint = ref({ x: 0, y: 0 })
const wearDrag = reactive({
  slot: '',
  ready: false,
  offsetX: 0,
  offsetY: 0,
  width: 0,
  height: 0,
  zoneLeft: 0,
  zoneTop: 0,
  zoneWidth: 0,
  zoneHeight: 0,
  startX: 0,
  startY: 0,
  hasMoved: false
})
const transformDrag = reactive({
  slot: '',
  centerX: 0,
  centerY: 0,
  startDistance: 0,
  startAngle: 0,
  startScale: 1,
  startRotate: 0
})
const lastWearTap = reactive({
  slot: '',
  time: 0
})
const selected = reactive({
  clothes: null,
  pants: null,
  shoes: null
})
const wearPositions = reactive({
  clothes: { x: 0, y: 0, moved: false, scale: 1, rotate: 0 },
  pants: { x: 0, y: 0, moved: false, scale: 1, rotate: 0 },
  shoes: { x: 0, y: 0, moved: false, scale: 1, rotate: 0 }
})

const itemsByCategory = computed(() => {
  return CATEGORY_TREE.reduce((groups, category) => {
    groups[category.key] = items.value.filter((item) => item.category === category.key)
    return groups
  }, {})
})
const ghostStyle = computed(() => `left:${dragPoint.value.x - 42}px;top:${dragPoint.value.y - 42}px;`)

onShow(() => {
  items.value = getWardrobeItems()
})

function startSourceDrag(item, event) {
  const touch = getTouchPoint(event)
  if (!touch) {
    return
  }
  dragCandidate.value = item
  dragPoint.value = { x: touch.clientX, y: touch.clientY }
  dragStartPoint.value = { x: touch.clientX, y: touch.clientY }
}

function moveSourceDrag(event) {
  const touch = getTouchPoint(event)
  if (!touch) {
    return
  }
  dragPoint.value = { x: touch.clientX, y: touch.clientY }

  if (draggingItem.value) {
    return
  }

  if (!dragCandidate.value) {
    return
  }

  const moveX = touch.clientX - dragStartPoint.value.x
  const moveY = touch.clientY - dragStartPoint.value.y
  if (Math.abs(moveY) > 14 && Math.abs(moveY) > Math.abs(moveX)) {
    dragCandidate.value = null
    return
  }
  if (moveX > 18 && moveX > Math.abs(moveY) * 1.2) {
    draggingItem.value = dragCandidate.value
    dragCandidate.value = null
  }
}

function endSourceDrag() {
  dragCandidate.value = null
  const item = draggingItem.value
  if (!item) {
    return
  }
  draggingItem.value = null
  queryZoneRect().then((zoneRect) => {
    if (!zoneRect) {
      return
    }
    const inZone =
      dragPoint.value.x >= zoneRect.left &&
      dragPoint.value.x <= zoneRect.right &&
      dragPoint.value.y >= zoneRect.top &&
      dragPoint.value.y <= zoneRect.bottom
    if (inZone) {
      equip(item)
      uni.showToast({ title: '已放到人物上', icon: 'none' })
    }
  })
}

function cancelSourceDrag() {
  dragCandidate.value = null
  draggingItem.value = null
}

function equip(item) {
  if (!item || !Object.prototype.hasOwnProperty.call(selected, item.category)) {
    return
  }
  selected[item.category] = item
  activeSlot.value = item.category
  resetWearPosition(item.category)
}

function clearSelected() {
  selected.clothes = null
  selected.pants = null
  selected.shoes = null
  resetWearPosition('clothes')
  resetWearPosition('pants')
  resetWearPosition('shoes')
  activeSlot.value = ''
}

function savePlan() {
  const picked = [selected.clothes, selected.pants, selected.shoes].filter(Boolean)
  if (picked.length === 0) {
    uni.showToast({ title: '请先选择衣物', icon: 'none' })
    return
  }

  queryZoneRect().then((zoneRect) => {
    addOutfitPlan({
      name: `搭配方案 ${new Date().toLocaleString()}`,
      items: {
        clothes: selected.clothes,
        pants: selected.pants,
        shoes: selected.shoes
      },
      positions: getSavedPositions(zoneRect)
    })
    clearSelected()
    uni.showToast({ title: '方案已保存', icon: 'success' })
  })
}

function subLabel(item) {
  return getSubcategoryLabel(item.category, item.subcategory)
}

function wearStyle(slot) {
  const position = wearPositions[slot]
  if (!position) {
    return ''
  }
  const transform = getWearTransform(slot)
  if (!position.moved) {
    return `transform:translateX(-50%) ${transform};`
  }
  return `left:${position.x}px;top:${position.y}px;transform:${transform};`
}

function resetWearPosition(slot) {
  if (!wearPositions[slot]) {
    return
  }
  wearPositions[slot].x = 0
  wearPositions[slot].y = 0
  wearPositions[slot].moved = false
  wearPositions[slot].scale = 1
  wearPositions[slot].rotate = 0
}

function handleWearTap(slot) {
  const now = Date.now()
  if (lastWearTap.slot === slot && now - lastWearTap.time < 320) {
    selected[slot] = null
    resetWearPosition(slot)
    if (activeSlot.value === slot) {
      activeSlot.value = ''
    }
    lastWearTap.slot = ''
    lastWearTap.time = 0
    uni.showToast({ title: '已脱掉', icon: 'none' })
    return
  }
  activeSlot.value = slot
  lastWearTap.slot = slot
  lastWearTap.time = now
}

function startWearDrag(slot, event) {
  if (!wearPositions[slot]) {
    return
  }
  activeSlot.value = slot
  const touch = getTouchPoint(event)
  if (!touch) {
    return
  }
  wearDrag.slot = slot
  wearDrag.ready = false
  wearDrag.startX = touch.clientX
  wearDrag.startY = touch.clientY
  wearDrag.hasMoved = false

  queryRects(`#wear-${slot}`, '#personZone').then(({ itemRect, zoneRect }) => {
    if (!itemRect || !zoneRect || wearDrag.slot !== slot) {
      cancelWearDrag()
      return
    }
    wearDrag.offsetX = touch.clientX - itemRect.left
    wearDrag.offsetY = touch.clientY - itemRect.top
    wearDrag.width = itemRect.width
    wearDrag.height = itemRect.height
    wearDrag.zoneLeft = zoneRect.left
    wearDrag.zoneTop = zoneRect.top
    wearDrag.zoneWidth = zoneRect.width
    wearDrag.zoneHeight = zoneRect.height
    wearPositions[slot].x = itemRect.left - zoneRect.left
    wearPositions[slot].y = itemRect.top - zoneRect.top
    wearPositions[slot].moved = true
    wearDrag.ready = true
  })
}

function moveWearDrag(event) {
  if (!wearDrag.slot || !wearDrag.ready) {
    return
  }
  const position = wearPositions[wearDrag.slot]
  if (!position) {
    cancelWearDrag()
    return
  }
  const touch = getTouchPoint(event)
  if (!touch) {
    return
  }
  if (Math.abs(touch.clientX - wearDrag.startX) > 8 || Math.abs(touch.clientY - wearDrag.startY) > 8) {
    wearDrag.hasMoved = true
  }

  const slot = wearDrag.slot
  const nextX = touch.clientX - wearDrag.zoneLeft - wearDrag.offsetX
  const nextY = touch.clientY - wearDrag.zoneTop - wearDrag.offsetY
  position.x = clamp(nextX, 0, wearDrag.zoneWidth - wearDrag.width)
  position.y = clamp(nextY, 0, wearDrag.zoneHeight - wearDrag.height)
  position.moved = true
}

function endWearDrag(event) {
  const slot = wearDrag.slot
  if (slot && !wearDrag.hasMoved) {
    handleWearTap(slot)
  }
  cancelWearDrag()
}

function cancelWearDrag() {
  wearDrag.slot = ''
  wearDrag.ready = false
  wearDrag.width = 0
  wearDrag.height = 0
  wearDrag.hasMoved = false
}

function startTransformDrag(slot, event) {
  if (!wearPositions[slot]) {
    return
  }
  activeSlot.value = slot
  transformDrag.slot = slot
  const touch = getTouchPoint(event)
  if (!touch) {
    return
  }

  queryRect(`#wear-${slot}`).then((itemRect) => {
    if (!itemRect || transformDrag.slot !== slot) {
      endTransformDrag()
      return
    }
    const centerX = itemRect.left + itemRect.width / 2
    const centerY = itemRect.top + itemRect.height / 2
    transformDrag.centerX = centerX
    transformDrag.centerY = centerY
    transformDrag.startDistance = getDistance(touch.clientX, touch.clientY, centerX, centerY)
    transformDrag.startAngle = getAngle(touch.clientX, touch.clientY, centerX, centerY)
    transformDrag.startScale = wearPositions[slot].scale
    transformDrag.startRotate = wearPositions[slot].rotate
  })
}

function moveTransformDrag(event) {
  if (!transformDrag.slot) {
    return
  }
  const touch = getTouchPoint(event)
  if (!touch) {
    return
  }

  const position = wearPositions[transformDrag.slot]
  if (!position) {
    endTransformDrag()
    return
  }
  const distance = getDistance(touch.clientX, touch.clientY, transformDrag.centerX, transformDrag.centerY)
  const angle = getAngle(touch.clientX, touch.clientY, transformDrag.centerX, transformDrag.centerY)
  const nextScale = transformDrag.startScale * (distance / Math.max(transformDrag.startDistance, 1))
  position.scale = clamp(Number(nextScale.toFixed(2)), 0.5, 2.2)
  position.rotate = Math.round(transformDrag.startRotate + angle - transformDrag.startAngle)
}

function endTransformDrag() {
  transformDrag.slot = ''
}

function queryRects(itemSelector, zoneSelector) {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery()
    query.select(itemSelector).boundingClientRect()
    query.select(zoneSelector).boundingClientRect()
    query.exec(([itemRect, zoneRect]) => {
      resolve({ itemRect, zoneRect })
    })
  })
}

function queryRect(selector) {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .select(selector)
      .boundingClientRect()
      .exec(([rect]) => {
        resolve(rect)
      })
  })
}

function queryZoneRect() {
  return new Promise((resolve) => {
    uni.createSelectorQuery()
      .select('#personZone')
      .boundingClientRect()
      .exec(([zoneRect]) => {
        resolve(zoneRect)
      })
  })
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function getSavedPositions(zoneRect) {
  return ['clothes', 'pants', 'shoes'].reduce((positions, slot) => {
    const position = wearPositions[slot]
    const sizeRate = getBaseSizeRate(slot)
    positions[slot] = {
      moved: position.moved,
      xRate: position.moved && zoneRect?.width ? position.x / zoneRect.width : 0,
      yRate: position.moved && zoneRect?.height ? position.y / zoneRect.height : 0,
      widthRate: sizeRate.widthRate,
      heightRate: sizeRate.heightRate,
      scale: position.scale,
      rotate: position.rotate
    }
    return positions
  }, {})
}

function getWearTransform(slot) {
  const position = wearPositions[slot]
  if (!position) {
    return ''
  }
  return `scale(${position.scale}) rotate(${position.rotate}deg)`
}

function getBaseSizeRate(slot) {
  const sizes = {
    clothes: { widthRate: 230 / 452, heightRate: 210 / 820 },
    pants: { widthRate: 220 / 452, heightRate: 220 / 820 },
    shoes: { widthRate: 250 / 452, heightRate: 120 / 820 }
  }
  return sizes[slot]
}

function getTouchPoint(event) {
  const touch = event.touches?.[0] || event.changedTouches?.[0]
  if (!touch) {
    return null
  }
  return {
    clientX: touch.clientX ?? touch.pageX,
    clientY: touch.clientY ?? touch.pageY
  }
}

function getDistance(x, y, centerX, centerY) {
  return Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
}

function getAngle(x, y, centerX, centerY) {
  return (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI
}
</script>

<style scoped>
.page {
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.summary {
  margin-bottom: 18rpx;
  padding: 18rpx 20rpx;
  color: #3b4542;
  background: #ffffff;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
  font-size: 26rpx;
}

.stage {
  display: grid;
  grid-template-columns: 240rpx 1fr;
  gap: 18rpx;
  flex: 1;
  min-height: 0;
}

.left-panel,
.person-zone {
  background: #ffffff;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
  overflow: hidden;
}

.cloth-scroll {
  height: 100%;
}

.category-section {
  padding: 16rpx 12rpx 6rpx;
  border-bottom: 1rpx solid #edf1ef;
}

.category-title {
  position: sticky;
  top: 0;
  z-index: 1;
  height: 58rpx;
  line-height: 58rpx;
  padding-left: 10rpx;
  color: #ffffff;
  background: #156b6a;
  border-radius: 8px;
  font-size: 26rpx;
  font-weight: 600;
}

.empty {
  padding: 28rpx 8rpx;
  text-align: center;
  color: #69736f;
  font-size: 26rpx;
}

.draggable-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin: 18rpx auto;
  width: 172rpx;
  padding: 12rpx;
  background: #f4f6f5;
  border: 1rpx solid #dce4df;
  border-radius: 8px;
}

.thumb {
  width: 132rpx;
  height: 132rpx;
  border-radius: 8px;
  background: #e7ece9;
}

.item-name {
  width: 100%;
  text-align: center;
  color: #3b4542;
  font-size: 24rpx;
}

.person-zone {
  position: relative;
  min-height: 0;
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

.wear-box {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  touch-action: none;
}

.wear-box.moved {
  left: 0;
  transform: none;
}

.wear-image {
  width: 100%;
  height: 100%;
}

.wear-frame {
  position: absolute;
  left: -10rpx;
  right: -10rpx;
  top: -10rpx;
  bottom: -10rpx;
  border: 3rpx dashed #156b6a;
  border-radius: 8px;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 34rpx;
  height: 34rpx;
  border: 3rpx solid #156b6a;
  background: #ffffff;
  border-radius: 8px;
  box-sizing: border-box;
  pointer-events: auto;
}

.corner-left-top {
  left: -18rpx;
  top: -18rpx;
}

.corner-left-bottom {
  left: -18rpx;
  bottom: -18rpx;
}

.corner-right-bottom {
  right: -22rpx;
  bottom: -22rpx;
}

.adjust-handle {
  width: 46rpx;
  height: 46rpx;
  line-height: 42rpx;
  text-align: center;
  color: #ffffff;
  background: #156b6a;
  font-size: 22rpx;
  font-weight: 600;
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

.drop-hint {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  color: #69736f;
  font-size: 24rpx;
}

.drag-ghost {
  position: fixed;
  z-index: 10;
  width: 84px;
  height: 84px;
  pointer-events: none;
}

.ghost-image {
  width: 84px;
  height: 84px;
  border-radius: 8px;
  box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.18);
}

.actions {
  margin-top: 16rpx;
}

.primary {
  width: 100%;
  box-sizing: border-box;
  height: 84rpx;
  line-height: 84rpx;
  font-size: 28rpx;
  border-radius: 8px;
}

.primary {
  color: #ffffff;
  background: #156b6a;
}

</style>
