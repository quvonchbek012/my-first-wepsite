import { BRAND } from '../config/brand'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from './products'

/**
 * Admin panel → Sozlamalar bo'limida tahrirlanadigan do'kon sozlamalari.
 * Boshlang'ich qiymatlar `config/brand.js` va katalog konstantalaridan olinadi.
 */
export const DEFAULT_SETTINGS = {
  storeName: BRAND.name,
  tagline: BRAND.tagline,
  city: BRAND.city,
  phone: BRAND.phone,
  workHours: BRAND.workHours,
  address: BRAND.address,
  telegram: BRAND.telegram,
  instagram: BRAND.instagram,
  supportNote: BRAND.supportNote,

  // Yetkazib berish
  deliveryFee: DELIVERY_FEE,
  freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
  deliveryTime: '30 daqiqada',

  // Do'kon holati va e'lon
  storeOpen: true,
  announcement: '',
}

export const SETTINGS_KEY = 'freshmarket.settings.v1'

/** Eski saqlangan sozlamalarni yangi maydonlar bilan birlashtiradi. */
export function normalizeSettings(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS }
  const merged = { ...DEFAULT_SETTINGS, ...raw }
  merged.deliveryFee = Math.max(0, Number(merged.deliveryFee) || 0)
  merged.freeDeliveryThreshold = Math.max(0, Number(merged.freeDeliveryThreshold) || 0)
  merged.storeOpen = merged.storeOpen !== false
  return merged
}
