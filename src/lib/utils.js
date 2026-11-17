/** Narxni o'zbekcha formatda chiqaradi: 18500 -> "18 500 so'm" */
export function formatSom(value) {
  const n = Math.round(Number(value) || 0)
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`
}

/** Narxni faqat raqam bilan: "18 500" */
export function formatNumber(value) {
  const n = Math.round(Number(value) || 0)
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** Chegirma foizi: 23000, 19500 -> 15 */
export function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

export function lineTotal(item) {
  return item.price * item.qty
}

export function cartSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

export function deliveryFeeFor(subtotal, fee, threshold) {
  if (subtotal <= 0) return 0
  return subtotal >= threshold ? 0 : fee
}

export function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatTime(iso) {
  try {
    return new Intl.DateTimeFormat('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export const ORDER_STATUSES = [
  { id: 'new', label: 'Yangi', tone: 'blue' },
  { id: 'preparing', label: 'Tayyorlanmoqda', tone: 'amber' },
  { id: 'delivering', label: "Yo'lda", tone: 'violet' },
  { id: 'delivered', label: 'Yetkazildi', tone: 'emerald' },
  { id: 'cancelled', label: 'Bekor qilindi', tone: 'rose' },
]

export const STATUS_STYLES = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  emerald: 'bg-brand-50 text-brand-700 border-brand-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
}

export function statusMeta(id) {
  return ORDER_STATUSES.find((s) => s.id === id) || ORDER_STATUSES[0]
}

export const PAYMENT_LABELS = {
  cash: 'Naqd pul',
  click: 'Click',
  payme: 'Payme',
}

/** Telefon raqamni +998 90 123 45 67 ko'rinishida formatlaydi */
/** Telefon raqamdan tel: havolasi yasaydi */
export function telHref(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  return digits ? `tel:+${digits}` : '#'
}

export function formatPhone(input) {
  const digits = String(input || '').replace(/\D/g, '')
  const local = digits.startsWith('998') ? digits.slice(3) : digits
  const d = local.slice(0, 9)
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean)
  return parts.length ? `+998 ${parts.join(' ')}` : '+998 '
}

export function phoneDigits(input) {
  const digits = String(input || '').replace(/\D/g, '')
  return digits.startsWith('998') ? digits.slice(3) : digits
}

export function genOrderId() {
  const seq = Math.floor(1000 + Math.random() * 9000)
  return `FM-${seq}`
}

export function uid() {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
