import { useEffect, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { CATEGORIES } from '../../data/products'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'
import { categoryLabel } from '../../i18n/categoryKeys'

import Modal from '../ui/Modal'
import SmartImage from '../ui/SmartImage'

const EMPTY = {
  name: '',
  category: 'meva',
  price: '',
  oldPrice: '',
  unit: '1 kg',
  image: '',
  stock: 'in',
  isNew: false,
  rating: '4.5',
  reviews: '0',
  description: '',
  kcal: '',
  protein: '',
  fat: '',
  carbs: '',
}

function toForm(product) {
  if (!product) return EMPTY
  return {
    name: product.name || '',
    category: product.category || 'meva',
    price: String(product.price ?? ''),
    oldPrice: product.oldPrice ? String(product.oldPrice) : '',
    unit: product.unit || '',
    image: product.image || '',
    stock: product.stock || 'in',
    isNew: Boolean(product.isNew),
    rating: String(product.rating ?? '4.5'),
    reviews: String(product.reviews ?? 0),
    description: product.description || '',
    kcal: String(product.nutrition?.kcal ?? ''),
    protein: String(product.nutrition?.protein ?? ''),
    fat: String(product.nutrition?.fat ?? ''),
    carbs: String(product.nutrition?.carbs ?? ''),
  }
}

const isValidUrl = (value) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function ProductFormModal({ open, product, onClose }) {
  const { addProduct, updateProduct, toast } = useStore()
  const { t, money } = useI18n()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(toForm(product))
      setErrors({})
      setSaving(false)
    }
  }, [open, product])

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (form.name.trim().length < 2) next.name = t('form.errName', 'Mahsulot nomini kiriting')
    if (!form.category) next.category = t('form.errCategory', 'Kategoriyani tanlang')
    if (!form.price || Number(form.price) <= 0) next.price = t('form.errPrice', "Narxni to'g'ri kiriting")
    if (form.oldPrice && Number(form.oldPrice) <= Number(form.price))
      next.oldPrice = t('form.errOldPrice', 'Eski narx joriy narxdan katta bo‘lishi kerak')
    if (!form.unit.trim()) next.unit = t('form.errUnit', "O'lchov birligini kiriting (masalan 1 L)")
    if (form.rating === '' || Number(form.rating) < 0 || Number(form.rating) > 5)
      next.rating = t('form.errRating', 'Reyting 0 dan 5 gacha bo‘lishi kerak')
    if (!form.image.trim()) next.image = t('form.errImage', 'Rasm URL manzilini kiriting')
    else if (!isValidUrl(form.image.trim()))
      next.image = t('form.errImageUrl', 'URL http:// yoki https:// bilan boshlanishi kerak')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validate()) return
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      unit: form.unit.trim(),
      image: form.image.trim(),
      stock: form.stock,
      isNew: Boolean(form.isNew),
      rating: Math.min(5, Math.max(0, Number(form.rating) || 0)),
      reviews: Math.max(0, Number(form.reviews) || 0),
      description:
        form.description.trim() ||
        `${form.name.trim()} — ${CATEGORIES.find((c) => c.id === form.category)?.name} bo‘limidan sifatli mahsulot.`,
      nutrition: {
        kcal: Number(form.kcal) || 0,
        protein: Number(form.protein) || 0,
        fat: Number(form.fat) || 0,
        carbs: Number(form.carbs) || 0,
      },
    }

    if (product) {
      updateProduct(product.id, payload)
      toast(t('form.toastUpdated', '“{name}” yangilandi', { name: payload.name }))
    } else {
      addProduct({
        ...payload,
        id: `p-${Date.now().toString(36)}`,
      })
      toast(t('form.toastAdded', '“{name}” katalogga qo‘shildi', { name: payload.name }))
    }

    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      panelClassName="max-w-2xl"
      ariaLabel={product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
    >
      <form onSubmit={submit} noValidate className="max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-100 px-5 py-4 pr-14">
          <h2 className="text-lg font-extrabold tracking-tight text-ink">
            {product ? t('form.editTitle', 'Mahsulotni tahrirlash') : t('form.addTitle', 'Yangi mahsulot qo‘shish')}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {t('form.subtitle', 'O‘zgarishlar saqlangandan so‘ng do‘kon sahifasida darhol ko‘rinadi.')}
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-[1fr_180px]">
          <div className="space-y-3.5">
            <div>
              <label className="field-label" htmlFor="p-name">
                {t('form.name', 'Mahsulot nomi')}
              </label>
              <input
                id="p-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder={t('form.namePh', 'Masalan: Olma "Golden"')}
                className={`field ${errors.name ? 'border-rose-300' : ''}`}
              />
              {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="p-category">
                  {t('form.category', 'Kategoriya')}
                </label>
                <select
                  id="p-category"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="field h-[42px]"
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {categoryLabel(t, c)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="p-unit">
                  {t('form.unit', 'O‘lchov / og‘irlik')}
                </label>
                <input
                  id="p-unit"
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                  placeholder={t('form.unitPh', '1 L, 500 gr, 1 dona')}
                  className={`field ${errors.unit ? 'border-rose-300' : ''}`}
                />
                {errors.unit && <p className="mt-1 text-[11px] text-rose-600">{errors.unit}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="p-price">
                  {t('form.price', 'Narx (so‘m)')}
                </label>
                <input
                  id="p-price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="18500"
                  className={`field ${errors.price ? 'border-rose-300' : ''}`}
                />
                {errors.price && <p className="mt-1 text-[11px] text-rose-600">{errors.price}</p>}
                {form.price ? (
                  <p className="mt-1 text-[10px] text-brand-600">{money(form.price)}</p>
                ) : null}
              </div>
              <div>
                <label className="field-label" htmlFor="p-old-price">
                  {t('form.oldPrice', 'Eski narx')} <span className="normal-case text-slate-400">{t('common.optional', '(ixtiyoriy)')}</span>
                </label>
                <input
                  id="p-old-price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.oldPrice}
                  onChange={(e) => set('oldPrice', e.target.value)}
                  placeholder="23000"
                  className={`field ${errors.oldPrice ? 'border-rose-300' : ''}`}
                />
                {errors.oldPrice && (
                  <p className="mt-1 text-[11px] text-rose-600">{errors.oldPrice}</p>
                )}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="p-image">
                {t('form.imageUrl', 'Rasm URL')}
              </label>
              <div className="relative">
                <ImagePlus
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="p-image"
                  value={form.image}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={`field pl-9 text-[12px] ${errors.image ? 'border-rose-300' : ''}`}
                />
              </div>
              {errors.image && <p className="mt-1 text-[11px] text-rose-600">{errors.image}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="p-stock">
                  {t('form.status', 'Holat')}
                </label>
                <select
                  id="p-stock"
                  value={form.stock}
                  onChange={(e) => set('stock', e.target.value)}
                  className="field h-[42px]"
                >
                  <option value="in">{t('products.inStock', 'Sotuvda bor')}</option>
                  <option value="out">{t('products.out', 'Tugagan')}</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => set('isNew', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                  />
                  {t('form.newBadge', '“Yangi” belgisi')}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label" htmlFor="p-rating">
                  {t('form.rating', 'Reyting (0–5)')}
                </label>
                <input
                  id="p-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={(e) => set('rating', e.target.value)}
                  className={`field ${errors.rating ? 'border-rose-300' : ''}`}
                />
                {errors.rating && <p className="mt-1 text-[11px] text-rose-600">{errors.rating}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="p-reviews">
                  {t('form.reviews', 'Sharhlar soni')}
                </label>
                <input
                  id="p-reviews"
                  type="number"
                  min="0"
                  step="1"
                  value={form.reviews}
                  onChange={(e) => set('reviews', e.target.value)}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="p-description">
                {t('form.description', 'Tavsif')} <span className="normal-case text-slate-400">{t('common.optional', '(ixtiyoriy)')}</span>
              </label>
              <textarea
                id="p-description"
                rows={2}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={t('form.descriptionPh', 'Mahsulot haqida qisqa ma’lumot...')}
                className="field resize-none"
              />
            </div>

            <div>
              <span className="field-label">100 gr uchun ozuqa qiymati</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'kcal', label: 'kkal' },
                  { key: 'protein', label: 'Oqsil' },
                  { key: 'fat', label: "Yog'" },
                  { key: 'carbs', label: 'Uglevod' },
                ].map((f) => (
                  <input
                    key={f.key}
                    type="number"
                    min="0"
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.label}
                    aria-label={f.label}
                    className="field px-2 py-2 text-center text-[12px]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="sm:pt-7">
            <p className="field-label">Ko‘rinishi</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <SmartImage
                src={form.image}
                alt="Ko‘rinish"
                className="aspect-square w-full"
              />
              <div className="p-2.5">
                <p className="text-[9px] text-slate-400">{form.unit || t('form.previewUnit', 'o‘lchov')}</p>
                <p className="line-clamp-2 text-[11px] font-bold leading-tight text-ink">
                  {form.name || t('form.previewName', 'Mahsulot nomi')}
                </p>
                <p className="mt-1 text-[12px] font-extrabold text-ink">
                  {form.price ? money(form.price) : money(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-2 border-t border-slate-100 bg-white/95 px-5 py-3.5 backdrop-blur">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            {t('form.cancel', 'Bekor qilish')}
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {product ? t('form.save', 'Saqlash') : t('form.add', 'Qo‘shish')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
