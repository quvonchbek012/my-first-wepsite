import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useI18n } from '../../i18n/I18nContext'

/**
 * "Savatga +" tugmasi -> [- 1 +] kounteriga silliq o'tadi.
 */
export default function QuantityStepper({
  qty = 0,
  onAdd,
  onIncrement,
  onDecrement,
  disabled = false,
  size = 'md',
  className,
}) {
  const { t } = useI18n()
  const isSmall = size === 'sm'
  const height = isSmall ? 'h-9' : 'h-11'

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400',
          height,
          className,
        )}
      >
        {t('product.out', 'Tugagan')}
      </button>
    )
  }

  return (
    <div className={cn('relative w-full', height, className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {qty === 0 ? (
          <motion.button
            key="add"
            type="button"
            onClick={onAdd}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'flex h-full w-full items-center justify-center gap-1.5 rounded-xl border border-brand-100 bg-brand-50 text-sm font-bold text-brand-700 transition hover:border-brand-500 hover:bg-brand-500 hover:text-white active:scale-[0.98]',
              isSmall && 'text-xs',
            )}
            aria-label={t('product.addToCart', 'Savatga qo‘shish')}
          >
            <ShoppingBag size={isSmall ? 14 : 16} strokeWidth={2.4} />
            {t('product.addToCart', 'Savatga +')}
          </motion.button>
        ) : (
          <motion.div
            key="counter"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'flex h-full w-full items-center justify-between rounded-xl border border-brand-500 bg-white px-1 shadow-sm',
            )}
          >
            <button
              type="button"
              onClick={onDecrement}
              aria-label="Kamaytirish"
              className={cn(
                'grid place-items-center rounded-lg text-brand-700 transition hover:bg-brand-50 active:scale-90',
                isSmall ? 'h-7 w-7' : 'h-9 w-9',
              )}
            >
              <Minus size={isSmall ? 14 : 16} strokeWidth={2.6} />
            </button>
            <motion.span
              key={qty}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn('min-w-6 text-center font-extrabold text-ink', isSmall ? 'text-xs' : 'text-sm')}
            >
              {qty}
            </motion.span>
            <button
              type="button"
              onClick={onIncrement}
              aria-label="Ko'paytirish"
              className={cn(
                'grid place-items-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600 active:scale-90',
                isSmall ? 'h-7 w-7' : 'h-9 w-9',
              )}
            >
              <Plus size={isSmall ? 14 : 16} strokeWidth={2.6} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
