import { Clock3, Instagram, MapPin, Phone, Send, ShieldCheck } from 'lucide-react'
import { CATEGORIES } from '../../data/products'
import { useStore } from '../../store/StoreContext'
import { telHref } from '../../lib/utils'
import { useI18n } from '../../i18n/I18nContext'
import { categoryLabel } from '../../i18n/categoryKeys'
import Logo from './Logo'

export default function Footer({ onOpenAdmin, onCategoryChange }) {
  const { settings } = useStore()
  const { t } = useI18n()

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="container-page py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-slate-500">
              {t(
                'footer.about',
                '{name} — {city}dagi onlayn oziq-ovqat do‘koni. Yangi meva-sabzavot, sut mahsulotlari va ichimliklar 30 daqiqada eshigingizgacha.',
                { name: settings.storeName, city: settings.city },
              )}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href={`https://t.me/${settings.telegram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:text-brand-600"
                aria-label="Telegram"
              >
                <Send size={15} />
              </a>
              <a
                href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:text-brand-600"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('footer.categories', 'Kategoriyalar')}</p>
            <ul className="mt-3 space-y-2">
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onCategoryChange?.(c.id)}
                    className="text-[12px] font-medium text-slate-600 transition hover:text-brand-600"
                  >
                    {categoryLabel(t, c)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('footer.info', 'Ma’lumot')}</p>
            <ul className="mt-3 space-y-2 text-[12px] font-medium text-slate-600">
              <li>{t('footer.delivery', 'Yetkazib berish shartlari')}</li>
              <li>{t('footer.payments', 'To‘lov usullari')}</li>
              <li>{t('footer.returns', 'Mahsulotni qaytarish')}</li>
              <li>
                <button type="button" onClick={onOpenAdmin} className="transition hover:text-brand-600">
                  {t('footer.admin', 'Admin panel')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('footer.contact', 'Aloqa')}</p>
            <ul className="mt-3 space-y-2.5 text-[12px] text-slate-600">
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 shrink-0 text-brand-500" />
                <a href={telHref(settings.phone)} className="font-semibold hover:text-brand-600">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock3 size={14} className="mt-0.5 shrink-0 text-brand-500" />
                {settings.workHours}
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand-500" />
                {settings.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} {settings.storeName}. {t('footer.rights', 'Barcha huquqlar himoyalangan.')}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
            <ShieldCheck size={13} className="text-brand-500" />
            {t('footer.payNote', 'To‘lov: Naqd pul · Click · Payme')}
          </div>
        </div>
      </div>
    </footer>
  )
}
