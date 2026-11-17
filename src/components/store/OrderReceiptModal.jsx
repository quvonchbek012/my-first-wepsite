import { motion } from 'framer-motion'
import { Check, Clock3, MapPin, Phone, Receipt, Send, ShoppingBag, Truck, User } from 'lucide-react'
import Modal from '../ui/Modal'
import { PAYMENT_LABELS } from '../../lib/utils'
import { useI18n } from '../../i18n/I18nContext'

const TELEGRAM_LABELS = {
  sending: { key: 'receipt.tgSending', uz: 'Telegramga yuborilmoqda...', tone: 'text-slate-500' },
  sent: { key: 'receipt.tgSent', uz: 'Buyurtma Telegram guruhiga yuborildi', tone: 'text-brand-600' },
  demo: { key: 'receipt.tgDemo', uz: 'Demo rejim: Telegram tokeni sozlanmagan', tone: 'text-amber-600' },
  failed: { key: 'receipt.tgFailed', uz: 'Telegramga yuborilmadi — buyurtma panelda saqlandi', tone: 'text-rose-600' },
  idle: { key: '', uz: '', tone: 'text-slate-400' },
}

export default function OrderReceiptModal({ order, open, onClose, telegramState = 'idle' }) {
  const { t, money } = useI18n()
  if (!order) return null

  const tg = TELEGRAM_LABELS[telegramState] || TELEGRAM_LABELS.idle
  const totalQty = order.items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <Modal open={open} onClose={onClose} panelClassName="max-w-md" hideClose ariaLabel="Buyurtma qabul qilindi">
      <div className="max-h-[92vh] overflow-y-auto">
        {/* Yuqori qism */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-400 px-6 pb-8 pt-8 text-center text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-brand-600 shadow-lg"
          >
            <Check size={32} strokeWidth={3} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl font-extrabold tracking-tight"
          >
            {t('receipt.title', 'Buyurtma qabul qilindi!')}
          </motion.h2>
          <p className="mt-1 text-[13px] text-white/80">
            {t('receipt.subtitle', 'Operatorimiz 2 daqiqa ichida qo‘ng‘iroq qilib tasdiqlaydi.')}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold ring-1 ring-white/25 backdrop-blur">
            <Receipt size={15} /> #{order.id}
          </div>
        </div>

        <div className="px-5 py-4 safe-bottom">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
            <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-600">
              <Clock3 size={14} className="text-brand-600" /> {t('receipt.eta', 'Taxminiy yetkazish')}
            </span>
            <span className="text-[12px] font-extrabold text-ink">{t('receipt.etaValue', '25–35 daqiqa')}</span>
          </div>

          <div className="mt-4 space-y-2.5 text-[12px]">
            <Row icon={User} label={t('receipt.customer', 'Mijoz')} value={order.customer.name} />
            <Row icon={Phone} label={t('receipt.phone', 'Telefon')} value={order.customer.phone} />
            <Row icon={MapPin} label={t('receipt.address', 'Manzil')} value={order.customer.address} alignTop />
            {order.customer.comment ? (
              <Row icon={Receipt} label={t('receipt.comment', 'Izoh')} value={order.customer.comment} alignTop />
            ) : null}
            <Row icon={Truck} label={t('receipt.payment', 'To‘lov')} value={order.payment === 'cash' ? t('checkout.cash', 'Naqd pul') : order.payment === 'click' ? 'Click' : 'Payme'} />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3.5 py-2.5">
              <ShoppingBag size={14} className="text-slate-400" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {t('receipt.items', 'Mahsulotlar ({n})', { n: totalQty })}
              </span>
            </div>
            <div className="space-y-1.5 px-3.5 py-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-[12px]">
                  <span className="min-w-0 flex-1 text-slate-600">
                    {item.name} <span className="text-slate-400">× {item.qty}</span>
                  </span>
                  <span className="font-semibold text-ink">{money(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-dashed border-slate-200 px-3.5 py-2.5 text-[12px]">
              <div className="flex justify-between text-slate-500">
                <span>{t('order.subtotal', 'Mahsulotlar')}</span>
                <span className="font-semibold text-ink">{money(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>{t('order.delivery', 'Yetkazib berish')}</span>
                <span className={order.delivery === 0 ? 'font-bold text-brand-600' : 'font-semibold text-ink'}>
                  {order.delivery === 0 ? t('common.free', 'Bepul') : money(order.delivery)}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-[13px]">
                <span className="font-semibold text-slate-600">{t('order.total', 'Jami')}</span>
                <span className="text-base font-extrabold text-ink">{money(order.total)}</span>
              </div>
            </div>
          </div>

          {tg.key && (
            <p className={`mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium ${tg.tone}`}>
              <Send size={11} /> {tg.key ? t(tg.key, tg.uz) : ''}
            </p>
          )}

          <button type="button" onClick={onClose} className="btn-primary mt-4 h-11 w-full">
            {t('receipt.continue', 'Xaridni davom ettirish')}
          </button>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            {t('receipt.keep', 'Buyurtma raqamini saqlab qo‘ying — u orqali holatni bilib olasiz.')}
          </p>
        </div>
      </div>
    </Modal>
  )
}

function Row({ icon: Icon, label, value, alignTop = false }) {
  return (
    <div className={`flex gap-2.5 ${alignTop ? 'items-start' : 'items-center'}`}>
      <Icon size={14} className="mt-0.5 shrink-0 text-slate-400" />
      <span className="w-16 shrink-0 text-slate-400">{label}</span>
      <span className="min-w-0 flex-1 font-semibold leading-snug text-ink">{value}</span>
    </div>
  )
}
