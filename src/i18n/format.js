/** Admin kiritgan standart yetkazish vaqtini tanlangan tilga moslaydi. */
export function localizeDeliveryTime(value, lang) {
  const v = String(value || '').trim()
  if (lang === 'ru' && v === '30 daqiqada') return '30 минут'
  if (lang === 'en' && v === '30 daqiqada') return '30 minutes'
  return v
}
