import { motion } from 'framer-motion'
import { CheckCircle2, Clock3, Flame, ShieldCheck, Star, XCircle } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { localizeProduct } from '../../i18n/productI18n'
import { CATEGORIES } from '../../data/products'
import { discountPercent } from '../../lib/utils'
import Modal from '../ui/Modal'
import SmartImage from '../ui/SmartImage'
import QuantityStepper from '../ui/QuantityStepper'
import CategoryIcon from './CategoryIcon'

const CATEGORY_KEYS = {
  all: 'categories.all',
  ichimliklar: 'categories.beverages',
  meva: 'categories.fruits',
  sut: 'categories.dairy',
  non: 'categories.bakery',
  gosht: 'categories.meat',
  shirinliklar: 'categories.sweets',
}

export default function QuickViewModal() {
  const { quickViewId, closeQuickView, productMap, cart, addToCart, increment, decrement } = useStore()
  const { t, money, lang } = useI18n()
  const base = quickViewId ? productMap.get(quickViewId) : null
  const product = base ? localizeProduct(base, lang) : null

  if (!product) return <Modal open={false} onClose={closeQuickView}>{null}</Modal>

  const qty = cart[product.id] || 0
  const off = discountPercent(product.price, product.oldPrice)
  const category = CATEGORIES.find((c) => c.id === product.category)
  const isOut = product.stock === 'out'

  return (
    <Modal open={Boolean(quickViewId)} onClose={closeQuickView} panelClassName="max-w-4xl" ariaLabel={product.name}>
      <div className="grid max-h-[92vh] overflow-y-auto md:grid-cols-2">
        <div className="relative bg-slate-50">
          <SmartImage
            src={product.image}
            alt={product.name}
            className="aspect-[16/10] w-full md:aspect-auto md:h-full md:min-h-[420px]"
            loading="eager"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {off > 0 && <span className="badge-discount">-{off}%</span>}
            {product.isNew && (
              <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
                Yangi
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col p-5 pt-10 sm:p-6 sm:pt-10">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-brand-600">
            <CategoryIcon id={product.category} size={13} />
            {t(CATEGORY_KEYS[product.category], category?.name || '')}
          </div>

          <h3 className="mt-1.5 pr-6 text-xl font-extrabold leading-tight tracking-tight text-ink sm:text-2xl">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {product.rating?.toFixed(1)}
            </span>
            <span>{t('product.rating', '{n} ta sharh', { n: product.reviews })}</span>
            <span className="text-slate-300">·</span>
            <span>{product.unit}</span>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{product.description}</p>

          <div className="mt-4 rounded-2xl bg-slate-50 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <Flame size={13} className="text-amber-500" /> {t('quick.per100', '100 gramm uchun')}
            </p>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Kaloriya', value: `${product.nutrition.kcal}`, unit: t('quick.caloriesUnit', 'kkal') },
                { label: 'Oqsil', value: `${product.nutrition.protein}`, unit: 'g' },
                { label: "Yog'", value: `${product.nutrition.fat}`, unit: 'g' },
                { label: 'Uglevod', value: `${product.nutrition.carbs}`, unit: 'g' },
              ].map((n) => (
                <div key={n.label} className="rounded-xl bg-white px-1 py-2 shadow-sm">
                  <p className="whitespace-nowrap text-[13px] font-extrabold text-ink">
                    {n.value}
                    <span className="ml-0.5 text-[9px] font-semibold text-slate-400">{n.unit}</span>
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                    {n.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={13} className="text-brand-500" /> {t('quick.delivery30', '30 daqiqada yetkaziladi')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-brand-500" /> {t('quick.quality', 'Sifat kafolati')}
            </span>
            <span
              className={
                isOut
                  ? 'inline-flex items-center gap-1.5 font-bold text-rose-600'
                  : 'inline-flex items-center gap-1.5 font-bold text-brand-600'
              }
            >
              {isOut ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
              {isOut ? t('quick.outStock', 'Sotuvda yo‘q') : t('quick.inStock', 'Sotuvda bor')}
            </span>
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-end gap-2">
              <motion.p
                key={product.price}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-extrabold tracking-tight text-ink"
              >
                {money(product.price)}
              </motion.p>
              {product.oldPrice ? (
                <p className="pb-1 text-sm font-medium text-slate-400 line-through">
                  {money(product.oldPrice)}
                </p>
              ) : null}
            </div>

            <div className="mt-3">
              <QuantityStepper
                qty={qty}
                disabled={isOut}
                onAdd={() => addToCart(product.id)}
                onIncrement={() => increment(product.id)}
                onDecrement={() => decrement(product.id)}
              />
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              {isOut
                ? t('quick.outNote', 'Bu mahsulot vaqtincha tugagan — keyinroq tekshiring')
                : t('quick.orderNote', 'Buyurtma 30 daqiqa ichida yetkazib beriladi')}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
