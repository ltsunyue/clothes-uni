export const CATEGORY_TREE = [
  {
    key: 'clothes',
    label: '衣服',
    children: [
      { key: 'short_sleeve', label: '短袖' },
      { key: 'long_sleeve', label: '长袖' }
    ]
  },
  {
    key: 'pants',
    label: '裤子',
    children: [
      { key: 'shorts', label: '短裤' },
      { key: 'trousers', label: '长裤' }
    ]
  },
  {
    key: 'shoes',
    label: '鞋',
    children: [
      { key: 'sneakers', label: '运动鞋' },
      { key: 'casual_shoes', label: '休闲鞋' },
      { key: 'sandals', label: '凉鞋' }
    ]
  }
]

const CLOTHES_KEY = 'wardrobe_items'
const PLANS_KEY = 'outfit_plans'

export function getCategoryLabel(categoryKey) {
  return CATEGORY_TREE.find((category) => category.key === categoryKey)?.label || ''
}

export function getSubcategoryLabel(categoryKey, subcategoryKey) {
  const category = CATEGORY_TREE.find((item) => item.key === categoryKey)
  return category?.children.find((item) => item.key === subcategoryKey)?.label || ''
}

export function getWardrobeItems() {
  return uni.getStorageSync(CLOTHES_KEY) || []
}

export function saveWardrobeItems(items) {
  uni.setStorageSync(CLOTHES_KEY, items)
}

export function addWardrobeItem(payload) {
  const items = getWardrobeItems()
  const item = {
    id: `cloth_${Date.now()}`,
    createdAt: Date.now(),
    ...payload
  }
  saveWardrobeItems([item, ...items])
  return item
}

export function deleteWardrobeItem(id) {
  saveWardrobeItems(getWardrobeItems().filter((item) => item.id !== id))
}

export function getOutfitPlans() {
  return uni.getStorageSync(PLANS_KEY) || []
}

export function saveOutfitPlans(plans) {
  uni.setStorageSync(PLANS_KEY, plans)
}

export function addOutfitPlan(payload) {
  const plans = getOutfitPlans()
  const plan = {
    id: `plan_${Date.now()}`,
    createdAt: Date.now(),
    ...payload
  }
  saveOutfitPlans([plan, ...plans])
  return plan
}

export function deleteOutfitPlan(id) {
  saveOutfitPlans(getOutfitPlans().filter((plan) => plan.id !== id))
}
