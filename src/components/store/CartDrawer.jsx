import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Bike,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { localizeProduct } from '../../i18n/productI18n'
import SmartImage from '../ui/SmartImage'

export default function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    cartCount,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryLeft,
    freeDeliveryProgress,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    openCheckout,
    constants,
    settings,
    productMap,
  } = useStore()
  const { t, money, lang } = useI18n()

  const [confirmClear, setConfirmClear] = useState(false)
  const displayItems = cartItems.map((item) => localizeProduct(productMap.get(item.id) || item, lang))

  useEffect(() => {
    if (!isCartOpen) return
    const onKey = (e) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('overflow-hidden')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('overflow-hidden')
    }
  }, [isCartOpen, closeCart])

  useEffect(() => {
    if (!isCartOpen) setConfirmClear(false)
  }, [isCartOpen])

  return createPortal(
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t('cart.title', 'Savat')}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-lift"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {/* Sarlavha */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                  <ShoppingBag size={19} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-ink">{t('cart.title', 'Savat')}</h2>
                  <p className="text-[11px] text-slate-500">
                    {cartCount > 0 ? t('cart.itemsCount', '{n} ta mahsulot', { n: cartCount }) : t('cart.emptyShort', 'Hozircha bo‘sh')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {cartItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => (confirmClear ? (clearCart(), setConfirmClear(false)) : setConfirmClear(true))}
                    onBlur={() => setConfirmClear(false)}
                    className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    {confirmClear ? t('cart.clearConfirm', 'Ha, tozalash') : t('cart.clear', 'Tozalash')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeCart}
                  aria-label={t('cart.close', 'Savatni yopish')}
                  className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {displayItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-50 text-brand-500">
                  <ShoppingBag size={34} strokeWidth={1.6} />
                </div>
                <p className="mt-4 text-lg font-extrabold text-ink">{t('cart.emptyTitle', 'Savat hozircha bo‘sh')}</p>
                <p className="mt-1 max-w-xs text-sm text-slate-500">
                  {t('cart.emptyText', 'Katalogdan sevimli mahsulotlaringizni tanlab, savatga qo‘shing.')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCart()
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn-primary mt-5"
                >
                  {t('cart.startShopping', 'Xaridni boshlash')} <ArrowRight size={16} />
                </button>
                <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                  <Bike size={14} className="text-brand-500" />
                  {t('cart.freeFrom', '{amount}dan bepul yetkazib berish', {
                    amount: money(constants.FREE_DELIVERY_THRESHOLD),
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Bepul yetkazish progressi */}
                <div className="border-b border-slate-100 bg-gradient-to-br from-brand-50/80 to-white px-5 py-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-brand-600 shadow-sm">
                      <Truck size={15} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold leading-snug text-slate-700">
                        {freeDeliveryLeft > 0
                          ? t('cart.freeLeft', 'Bepul yetkazib berish uchun yana {amount}lik xarid qiling', {
                              amount: money(freeDeliveryLeft),
                            })
                          : t('cart.freeUnlocked', 'Bepul yetkazib berish faollashtirildi!')}
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${freeDeliveryProgress}%` }}
                          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mahsulotlar */}
                <div className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
                  <AnimatePresence initial={false}>
                    {displayItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-slate-50">
                          <SmartImage
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 shrink-0 rounded-xl"
                          />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-bold text-ink">{item.name}</p>
                                <p className="text-[11px] text-slate-400">{item.unit}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                aria-label={`${item.name}ni o'chirish`}
                                className="rounded-md p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-1.5">
                              <p className="text-[13px] font-extrabold text-ink">
                                {money(item.price * item.qty)}
                              </p>
                              <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                                <button
                                  type="button"
                                  onClick={() => decrement(item.id)}
                                  aria-label="Kamaytirish"
                                  className="grid h-7 w-7 place-items-center rounded-l-lg text-slate-500 transition hover:bg-slate-100"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="w-6 text-center text-[12px] font-bold text-ink">
                                  {item.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => increment(item.id)}
                                  aria-label="Ko'paytirish"
                                  className="grid h-7 w-7 place-items-center rounded-r-lg text-brand-600 transition hover:bg-brand-50"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Hisob-kitob */}
                <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-4 safe-bottom">
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between text-slate-500">
                      <span>{t('cart.items', 'Mahsulotlar')}</span>
                      <span className="font-semibold text-ink">{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>{t('cart.delivery', 'Yetkazib berish')}</span>
                      <span
                        className={
                          deliveryFee === 0 ? 'font-bold text-brand-600' : 'font-semibold text-ink'
                        }
                      >
                        {deliveryFee === 0 ? t('common.free', 'Bepul') : money(deliveryFee)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between border-t border-dashed border-slate-200 pt-3">
                    <span className="text-sm font-semibold text-slate-500">{t('common.total', 'Jami')}</span>
                    <motion.span
                      key={total}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl font-extrabold tracking-tight text-ink"
                    >
                      {money(total)}
                    </motion.span>
                  </div>
                  <button
                    type="button"
                    onClick={openCheckout}
                    disabled={!settings.storeOpen}
                    className="btn-primary mt-3 h-12 w-full text-[15px]"
                  >
                    {settings.storeOpen ? t('cart.checkout', 'Buyurtma berish') : t('cart.storeClosed', 'Do‘kon hozir yopiq')}
                    {settings.storeOpen && <ArrowRight size={17} />}
                  </button>
                  {!settings.storeOpen && (
                    <p className="mt-1.5 text-center text-[11px] font-medium text-amber-600">
                      {t('cart.closedNote', 'Buyurtmalar {hours} da qabul qilinadi', {
                        hours: settings.workHours,
                      })}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-2 w-full py-2 text-center text-[12px] font-semibold text-slate-500 transition hover:text-ink"
                  >
                    {t('cart.continue', 'Xaridni davom ettirish')}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
