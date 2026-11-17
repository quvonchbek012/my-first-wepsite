import { Megaphone, Store } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { useI18n } from '../../i18n/I18nContext'

/** Admin panelda kiritilgan e'lon yoki "do'kon yopiq" holatini ko'rsatadi. */
export default function StoreNotice() {
  const { settings } = useStore()
  const { t } = useI18n()
  const announcement = settings.announcement?.trim()
  if (settings.storeOpen && !announcement) return null

  const closed = !settings.storeOpen

  return (
    <div className="container-page pt-3 sm:pt-4">
      <div
        className={`flex items-start gap-2.5 rounded-2xl border px-3.5 py-2.5 sm:items-center ${
          closed
            ? 'border-amber-200 bg-amber-50 text-amber-900'
            : 'border-brand-200 bg-brand-50 text-brand-800'
        }`}
      >
        <span
          className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg sm:mt-0 ${
            closed ? 'bg-amber-100 text-amber-600' : 'bg-white text-brand-600'
          }`}
        >
          {closed ? <Store size={15} /> : <Megaphone size={15} />}
        </span>
        <p className="text-[12px] font-medium leading-relaxed">
          {closed && (
            <span className="font-bold">{t('notice.closed', 'Hozir do‘kon yopiq.')} </span>
          )}
          {announcement || t('notice.closedText', 'Buyurtmalar ish vaqti boshlanganda qabul qilinadi.')}
        </p>
      </div>
    </div>
  )
}
