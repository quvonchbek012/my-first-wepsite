/**
 * Telegram Bot API integratsiyasi.
 *
 * Sozlash:
 *   1) .env fayl yarating (namuna: .env.example)
 *   2) VITE_TELEGRAM_BOT_TOKEN va VITE_TELEGRAM_CHAT_ID ni kiriting
 *   3) Botni @BotFather orqali yarating, chat_id ni @userinfobot dan oling
 *
 * Token bo'lmasa funksiya xato bermaydi — buyurtma faqat lokal saqlanadi
 * va konsolga "skipped" xabari chiqadi.
 */
import { formatSom, PAYMENT_LABELS, formatPhone } from './utils'

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || ''

export const isTelegramConfigured = Boolean(BOT_TOKEN && CHAT_ID)

/** Buyurtma matnini Telegram (HTML parse mode) uchun tayyorlaydi. */
export function buildOrderMessage(order) {
  const items = order.items
    .map(
      (item, i) =>
        `${i + 1}. ${escapeHtml(item.name)} — ${item.qty} × ${formatSom(item.price)} = <b>${formatSom(
          item.price * item.qty,
        )}</b>`,
    )
    .join('\n')

  return [
    '🛒 <b>Yangi buyurtma — FreshMarket</b>',
    '',
    `<b>Buyurtma:</b> #${escapeHtml(order.id)}`,
    `<b>Mijoz:</b> ${escapeHtml(order.customer.name)}`,
    `<b>Telefon:</b> ${escapeHtml(order.customer.phone)}`,
    `<b>Manzil:</b> ${escapeHtml(order.customer.address)}`,
    order.customer.comment ? `<b>Izoh:</b> ${escapeHtml(order.customer.comment)}` : null,
    `<b>To'lov:</b> ${escapeHtml(PAYMENT_LABELS[order.payment] || order.payment)}`,
    '',
    '<b>Mahsulotlar:</b>',
    items,
    '',
    `Mahsulotlar: ${formatSom(order.subtotal)}`,
    `Yetkazib berish: ${order.delivery === 0 ? 'Bepul' : formatSom(order.delivery)}`,
    `<b>Jami: ${formatSom(order.total)}</b>`,
  ]
    .filter(Boolean)
    .join('\n')
}

/**
 * Buyurtmani Telegram guruhiga yuboradi.
 * @returns {Promise<{ok:boolean, skipped?:boolean, error?:string}>}
 */
export async function sendOrderToTelegram(order) {
  if (!isTelegramConfigured) {
    // Demo rejim: tarmoqqa chiqmaymiz, faqat konsolga yozamiz.
    console.info('[FreshMarket] Telegram sozlanmagan. Buyurtma:', order.id)
    return { ok: false, skipped: true }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: buildOrderMessage(order),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.description || `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error?.message || 'network error' }
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export { formatPhone }
