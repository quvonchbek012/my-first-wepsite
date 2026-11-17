import { Leaf } from 'lucide-react'
import { useStore } from '../../store/StoreContext'
import { cn } from '../../lib/utils'

function splitName(name) {
  const value = String(name || 'FreshMarket').trim()
  const match = value.match(/^(.+?)(Market|Bozor|Store|Do'kon)$/i)
  if (match && match[1]) return [match[1], match[2]]
  return [value, '']
}

export default function Logo({ compact = false, light = false, className }) {
  const { settings } = useStore()
  const [base, accent] = splitName(settings.storeName)

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-2xl shadow-brand',
          light ? 'bg-white/15 text-white ring-1 ring-white/25' : 'bg-brand-500 text-white',
        )}
      >
        <Leaf size={20} strokeWidth={2.4} />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className={cn('text-[17px] font-extrabold tracking-tight', light ? 'text-white' : 'text-ink')}>
            {base}
            {accent ? (
              <span className={light ? 'text-white/80' : 'text-brand-500'}>{accent}</span>
            ) : null}
          </p>
          <p
            className={cn(
              'whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.14em] lg:text-[9.5px]',
              light ? 'text-white/60' : 'text-slate-400',
            )}
          >
            Grocery & Beverages
          </p>
        </div>
      )}
    </div>
  )
}
