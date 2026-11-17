import { useMemo, useState } from 'react'
import { PackageSearch, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES } from '../../data/products'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { localizeProduct } from '../../i18n/productI18n'
import { cn } from '../../lib/utils'
import CategoryPills from './CategoryPills'
import ProductCard from './ProductCard'

const SORTS = [
  { id: 'featured', key: 'catalog.featured', label: 'Tavsiya etilgan' },
  { id: 'price-asc', key: 'catalog.priceAsc', label: 'Arzon narx' },
  { id: 'price-desc', key: 'catalog.priceDesc', label: 'Qimmat narx' },
  { id: 'discount', key: 'catalog.discount', label: 'Chegirma' },
]

export default function Catalog({ active, onCategoryChange, query, onClearQuery }) {
  const { products } = useStore()
  const { t, lang } = useI18n()
  const [sort, setSort] = useState('featured')

  const localized = useMemo(() => products.map((p) => localizeProduct(p, lang)), [products, lang])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    let list = localized.filter((p) => (active === 'all' ? true : p.category === active))
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.unit.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term),
      )
    }
    const sorted = [...list]
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    if (sort === 'discount')
      sorted.sort((a, b) => {
        const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0
        const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0
        return db - da
      })
    return sorted
  }, [localized, active, query, sort])

  const activeCategory = CATEGORIES.find((c) => c.id === active)
  const CATEGORY_KEYS = {
    all: 'categories.all',
    ichimliklar: 'categories.beverages',
    meva: 'categories.fruits',
    sut: 'categories.dairy',
    non: 'categories.bakery',
    gosht: 'categories.meat',
    shirinliklar: 'categories.sweets',
  }
  const activeName = activeCategory
    ? t(CATEGORY_KEYS[activeCategory.id], activeCategory.name)
    : t('categories.all', 'Barchasi')

  return (
    <section id="catalog" className="container-page mt-7 scroll-mt-32 sm:mt-9 md:scroll-mt-28">
      <CategoryPills active={active} onChange={onCategoryChange} />

      <div className="mt-7 flex flex-wrap items-end justify-between gap-3 border-t border-slate-200/80 pt-5">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-[22px]">
            {query ? t('catalog.results', 'Qidiruv natijalari') : activeName}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {t('catalog.found', '{n} ta mahsulot topildi', { n: filtered.length })}
            {query ? ` · "${query}"` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={onClearQuery}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <X size={12} /> {t('catalog.clearSearch', 'Qidiruvni tozalash')}
            </button>
          )}
          <div className="relative">
            <SlidersHorizontal
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label={t('catalog.sort', 'Saralash')}
              className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-[11px] font-semibold text-slate-600 outline-none transition hover:border-slate-300 focus:border-brand-400"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(s.key, s.label)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
              ▼
            </span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <PackageSearch size={26} />
          </div>
          <p className="mt-3 text-base font-bold text-ink">{t('catalog.empty', 'Mahsulot topilmadi')}</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {t('catalog.emptyText', 'Boshqa nom bilan qidirib ko‘ring yoki kategoriyani o‘zgartiring.')}
          </p>
          <button
            type="button"
            onClick={() => {
              onClearQuery?.()
              onCategoryChange('all')
            }}
            className={cn('btn-primary mt-4')}
          >
            {t('catalog.allProducts', 'Barcha mahsulotlar')}
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}
