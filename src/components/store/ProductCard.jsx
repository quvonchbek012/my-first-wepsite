import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { cn, discountPercent } from '../../lib/utils'
import SmartImage from '../ui/SmartImage'
import QuantityStepper from '../ui/QuantityStepper'

export default function ProductCard({ product, index = 0 }) {
  const { cart, addToCart, increment, decrement, openQuickView } = useStore()
  const { t, money } = useI18n()
  const qty = cart[product.id] || 0
  const off = discountPercent(product.price, product.oldPrice)
  const isOut = product.stock === 'out'

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.24) }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lift',
      )}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => openQuickView(product.id)}
          className="block w-full text-left"
          aria-label={`${product.name} haqida batafsil`}
        >
          <SmartImage
            src={product.image}
            alt={product.name}
            className="aspect-[4/3] w-full"
            imgClassName={cn('transition duration-500 group-hover:scale-[1.04]', isOut && 'grayscale')}
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        </button>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-col items-start gap-1.5">
          {off > 0 && <span className="badge-discount">-{off}%</span>}
          {product.isNew && (
            <span className="inline-flex items-center rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
              {t('product.new', 'Yangi')}
            </span>
          )}
        </div>

        {isOut && (
          <div className="absolute inset-0 grid place-items-center bg-white/45 backdrop-blur-[1px]">
            <span className="rounded-lg bg-ink/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              {t('product.out', 'Tugagan')}
            </span>
          </div>
        )}

        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm backdrop-blur">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          {product.rating?.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-medium text-slate-400">{product.unit}</p>
        <button
          type="button"
          onClick={() => openQuickView(product.id)}
          className="mt-0.5 line-clamp-2 min-h-[38px] text-left text-[13px] font-bold leading-snug text-ink transition hover:text-brand-600 sm:text-sm"
        >
          {product.name}
        </button>

        <div className="mt-2 flex flex-col">
          <p className="whitespace-nowrap text-[14px] font-extrabold leading-tight tracking-tight text-ink sm:text-[15px]">
            {money(product.price)}
          </p>
          <p className="mt-0.5 h-3 whitespace-nowrap text-[10px] font-medium text-slate-400 line-through sm:text-[11px]">
            {product.oldPrice ? money(product.oldPrice) : '\u00A0'}
          </p>
        </div>

        <div className="mt-2.5">
          <QuantityStepper
            qty={qty}
            disabled={isOut}
            size="sm"
            onAdd={() => addToCart(product.id)}
            onIncrement={() => increment(product.id)}
            onDecrement={() => decrement(product.id)}
          />
        </div>
      </div>
    </motion.article>
  )
}
