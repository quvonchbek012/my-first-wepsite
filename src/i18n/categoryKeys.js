export const CATEGORY_KEYS = {
  all: 'categories.all',
  ichimliklar: 'categories.beverages',
  meva: 'categories.fruits',
  sut: 'categories.dairy',
  non: 'categories.bakery',
  gosht: 'categories.meat',
  shirinliklar: 'categories.sweets',
}

export function categoryLabel(t, category) {
  if (!category) return ''
  return t(CATEGORY_KEYS[category.id] || `categories.${category.id}`, category.name || category.short || '')
}
