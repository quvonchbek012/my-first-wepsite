import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Skeleton + xato holatini o'zi boshqaradigan rasm.
 * Tarmoq uzilsa ham kartochka buzilmaydi.
 */
export default function SmartImage({ src, alt, className, imgClassName, loading = 'lazy' }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(!src)

  useEffect(() => {
    setLoaded(false)
    setFailed(!src)
  }, [src])

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', className)}>
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,#f1f5f9_0px,#e2e8f0_120px,#f1f5f9_240px)] bg-[length:400px_100%]" />
      )}
      {failed ? (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
          <div className="flex flex-col items-center gap-1.5">
            <ImageOff size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-wide">Rasm yo'q</span>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            'h-full w-full object-cover transition duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}
