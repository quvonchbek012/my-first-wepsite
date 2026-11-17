import { ChevronDown } from 'lucide-react'
import { ORDER_STATUSES, STATUS_STYLES, statusMeta } from '../../lib/utils'
import { useI18n } from '../../i18n/I18nContext'

export function StatusBadge({ status, size = 'md' }) {
  const { t } = useI18n()
  const meta = statusMeta(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${STATUS_STYLES[meta.tone]} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t(`status.${meta.id}`, meta.label)}
    </span>
  )
}

/** Rangli status tanlagichi — jadval ichida ishlatiladi. */
export function StatusSelect({ value, onChange, disabled = false }) {
  const { t } = useI18n()
  const meta = statusMeta(value)
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Buyurtma holati"
        className={`cursor-pointer appearance-none rounded-full border py-1 pl-6 pr-7 text-[11px] font-bold outline-none transition focus:ring-2 focus:ring-brand-500/20 ${STATUS_STYLES[meta.tone]}`}
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s.id} value={s.id} className="bg-white text-ink">
            {t(`status.${s.id}`, s.label)}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute left-2.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-current ${STATUS_STYLES[meta.tone].split(' ')[1]}`}
      />
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60"
      />
    </div>
  )
}
