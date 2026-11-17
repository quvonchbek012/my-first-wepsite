import { CATEGORIES } from '../../data/products'
import CategoryIcon from './CategoryIcon'
import { cn } from '../../lib/utils'
import { useI18n } from '../../i18n/I18nContext'

const CATEGORY_KEYS = {
  all: 'categories.all',
  ichimliklar: 'categories.beverages',
  meva: 'categories.fruits',
  sut: 'categories.dairy',
  non: 'categories.bakery',
  gosht: 'categories.meat',
  shirinliklar: 'categories.sweets',
}

export default function CategoryPills({ active, onChange }) {
  const { t } = useI18n()

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
          {t('categories.title', 'Kategoriyalar')}
        </h2>
        <p className="text-xs text-slate-500">
          {t('categories.subtitle', 'O‘zingizga kerakli bo‘limni tanlang')}
        </p>
      </div>

      {/* Mobil: gorizontal scroll · Desktop: barcha kategoriyalar ko'rinadi */}
      <div
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        role="tablist"
        aria-label="Mahsulot kategoriyalari"
      >
        {CATEGORIES.map((cat) => {
          const isActive = active === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(cat.id)}
              className={cn(
                'group inline-flex shrink-0 snap-start items-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-[12px] font-bold transition sm:gap-2 sm:px-3 sm:text-[12.5px]',
                isActive
                  ? 'border-brand-500 bg-brand-500 text-white shadow-brand'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700',
              )}
            >
              <CategoryIcon id={cat.id} size={15} className="shrink-0" />
              <span className="whitespace-nowrap">{t(CATEGORY_KEYS[cat.id], cat.name)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
