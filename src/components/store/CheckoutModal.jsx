import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Banknote,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { formatPhone, phoneDigits } from '../../lib/utils'
import { useI18n } from '../../i18n/I18nContext'
import { localizeProduct } from '../../i18n/productI18n'
import { sendOrderToTelegram } from '../../lib/telegram'
import Modal from '../ui/Modal'
import SmartImage from '../ui/SmartImage'
import OrderReceiptModal from './OrderReceiptModal'

const PAYMENTS = [
  { id: 'cash', label: ['checkout.cash', 'Naqd pul'], note: ['checkout.cashNote', 'Kuryerga to‘lang'], icon: Banknote },
  { id: 'click', label: ['checkout.click', 'Click'], note: ['checkout.online', 'Onlayn to‘lov'], icon: CreditCard },
  { id: 'payme', label: ['checkout.payme', 'Payme'], note: ['checkout.online', 'Onlayn to‘lov'], icon: Wallet },
]

const EMPTY_FORM = { name: '', phone: '+998 ', address: '', comment: '' }

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    closeCheckout,
    cartItems,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryLeft,
    createOrder,
    toast,
    settings,
    productMap,
  } = useStore()
  const { t, money, lang } = useI18n()

  const [form, setForm] = useState(EMPTY_FORM)
  const [payment, setPayment] = useState('cash')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [telegramState, setTelegramState] = useState('idle')

  useEffect(() => {
    if (!isCheckoutOpen) setErrors({})
  }, [isCheckoutOpen])

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = t('checkout.errName', 'Ismingizni kiriting (kamida 2 ta harf)')
    if (phoneDigits(form.phone).length !== 9)
      next.phone = t('checkout.errPhone', "Telefon raqamni to'liq kiriting: +998 90 123 45 67")
    if (form.address.trim().length < 6) next.address = t('checkout.errAddress', 'Yetkazib berish manzilini kiriting')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    if (!settings.storeOpen) {
      toast(t('checkout.closedToast', 'Do‘kon hozir yopiq — buyurtma qabul qilinmaydi'), 'error')
      return
    }
    if (!cartItems.length) {
      toast(t('checkout.emptyToast', 'Savat bo‘sh — avval mahsulot tanlang'), 'error')
      return
    }
    if (!validate()) return

    setSubmitting(true)
    const order = createOrder({
      customer: {
        name: form.name.trim(),
        phone: formatPhone(form.phone),
        address: form.address.trim(),
        comment: form.comment.trim(),
      },
      payment,
    })
    setReceipt(order)
    setTelegramState('sending')
    closeCheckout()
    setSubmitting(false)
    setForm(EMPTY_FORM)
    setPayment('cash')

    const result = await sendOrderToTelegram(order)
    setTelegramState(result.ok ? 'sent' : result.skipped ? 'demo' : 'failed')
  }

  return (
    <>
      <Modal
        open={isCheckoutOpen}
        onClose={closeCheckout}
        panelClassName="max-w-3xl"
        ariaLabel={t('checkout.title', 'Buyurtmani rasmiylashtirish')}
      >
        <div className="max-h-[92vh] overflow-y-auto">
          <div className="border-b border-slate-100 px-5 py-4 pr-14 sm:px-6">
            <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
              {t('checkout.title', 'Buyurtmani rasmiylashtirish')}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {t('checkout.subtitle', 'Ma’lumotlaringizni kiriting — operatorimiz darhol tasdiqlaydi.')}
            </p>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1.15fr_0.85fr]">
            {/* Forma */}
            <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label className="field-label" htmlFor="customer-name">
                  {t('checkout.name', 'Ism va familiya')}
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="customer-name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder={t('checkout.namePh', 'Aziza Karimova')}
                    autoComplete="name"
                    className={`field pl-9 ${errors.name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10' : ''}`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.name}</p>}
              </div>

              <div>
                <label className="field-label" htmlFor="customer-phone">
                  {t('checkout.phone', 'Telefon raqami')}
                </label>
                <div className="relative">
                  <Phone
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="customer-phone"
                    value={form.phone}
                    onChange={(e) => update('phone', formatPhone(e.target.value))}
                    placeholder="+998 90 123 45 67"
                    inputMode="tel"
                    autoComplete="tel"
                    className={`field pl-9 ${errors.phone ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10' : ''}`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.phone}</p>}
              </div>

              <div>
                <label className="field-label" htmlFor="customer-address">
                  {t('checkout.address', 'Yetkazib berish manzili')}
                </label>
                <div className="relative">
                  <MapPin
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
                  />
                  <textarea
                    id="customer-address"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    rows={2}
                    placeholder={t('checkout.addressPh', 'Toshkent sh., Chilonzor tumani, 19-mavze, 45-uy, 12-xonadon')}
                    autoComplete="street-address"
                    className={`field resize-none pl-9 ${errors.address ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10' : ''}`}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="field-label" htmlFor="customer-comment">
                  {t('checkout.comment', 'Izoh')} <span className="font-normal normal-case text-slate-400">{t('common.optional', '(ixtiyoriy)')}</span>
                </label>
                <input
                  id="customer-comment"
                  value={form.comment}
                  onChange={(e) => update('comment', e.target.value)}
                  placeholder={t('checkout.commentPh', 'Masalan: domofon 12, lift ishlamaydi')}
                  className="field"
                />
              </div>

              <div>
                <span className="field-label">{t('checkout.payment', 'To‘lov usuli')}</span>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENTS.map((method) => {
                    const active = payment === method.id
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayment(method.id)}
                        aria-pressed={active}
                        className={`relative flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition ${
                          active
                            ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/15'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <method.icon size={17} className={active ? 'text-brand-600' : 'text-slate-400'} />
                        <span className="text-[12px] font-bold text-ink">{t(method.label[0], method.label[1])}</span>
                        <span className="text-[10px] leading-tight text-slate-400">{t(method.note[0], method.note[1])}</span>
                        {active && (
                          <motion.span
                            layoutId="payment-dot"
                            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-500"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </form>

            {/* Buyurtma xulosasi */}
            <div className="md:border-l md:border-slate-100 md:pl-6">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {t('checkout.orderItems', 'Buyurtma tarkibi')}
                </p>
                <div className="mt-2.5 max-h-56 space-y-2.5 overflow-y-auto pr-1">
                  {cartItems.map((item) => localizeProduct(productMap.get(item.id) || item, lang)).map((item) => (
                    <div key={item.id} className="flex items-center gap-2.5">
                      <div className="relative shrink-0">
                        <SmartImage src={item.image} alt={item.name} className="h-10 w-10 rounded-lg" />
                        <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">
                          {item.qty}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold text-ink">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.unit}</p>
                      </div>
                      <p className="text-[12px] font-bold text-ink">{money(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-3 text-[12px]">
                  <div className="flex justify-between text-slate-500">
                    <span>{t('cart.items', 'Mahsulotlar')}</span>
                    <span className="font-semibold text-ink">{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{t('cart.delivery', 'Yetkazib berish')}</span>
                    <span className={deliveryFee === 0 ? 'font-bold text-brand-600' : 'font-semibold text-ink'}>
                      {deliveryFee === 0 ? t('common.free', 'Bepul') : money(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex items-end justify-between pt-1.5">
                    <span className="text-[13px] font-semibold text-slate-500">{t('common.total', 'Jami')}</span>
                    <span className="text-lg font-extrabold text-ink">{money(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2.5 text-[11px] text-brand-800">
                <Clock3 size={14} className="mt-0.5 shrink-0" />
                {freeDeliveryLeft > 0
                  ? t('checkout.addMore', 'Bepul yetkazish uchun yana {amount} qo‘shing — yoki {fee} yetkazish to‘lovi.', {
                      amount: money(freeDeliveryLeft),
                      fee: money(deliveryFee),
                    })
                  : t('checkout.freeNote', 'Buyurtmangiz bepul yetkaziladi. Taxminiy vaqt — 30 daqiqa.')}
              </div>

              <div className="mt-2 flex items-start gap-2 px-1 text-[10px] leading-relaxed text-slate-400">
                <ShieldCheck size={13} className="mt-0.5 shrink-0" />
                {t('checkout.secureNote', 'Ma’lumotlaringiz faqat buyurtmani yetkazish uchun ishlatiladi va uchinchi tomonga berilmaydi.')}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center gap-2.5 border-t border-slate-100 bg-white/95 px-4 py-3.5 backdrop-blur sm:gap-3 sm:px-6 safe-bottom">
            <button type="button" onClick={closeCheckout} className="btn-ghost flex-1 sm:flex-none">
              {t('checkout.cancel', 'Bekor qilish')}
            </button>
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting || !cartItems.length || !settings.storeOpen}
              className="btn-primary h-11 flex-1 whitespace-nowrap px-3 text-[13px] sm:text-[14px]"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {t('checkout.sending', 'Yuborilmoqda...')}
                </>
              ) : (
                <>
                  <span className="sm:hidden">
                    {settings.storeOpen ? t('checkout.confirmShort', 'Tasdiqlash · {total}', { total: money(total) }) : t('cart.storeClosed', 'Do‘kon yopiq')}
                  </span>
                  <span className="hidden sm:inline">
                    {settings.storeOpen
                      ? t('checkout.submit', 'Buyurtmani tasdiqlash · {total}', { total: money(total) })
                      : t('cart.storeClosed', 'Do‘kon hozir yopiq')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <OrderReceiptModal
        order={receipt}
        open={Boolean(receipt)}
        telegramState={telegramState}
        onClose={() => setReceipt(null)}
      />
    </>
  )
}
