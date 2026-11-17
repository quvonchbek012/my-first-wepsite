import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { SEED_PRODUCTS, SEED_ORDERS } from '../data/products'
import { DEFAULT_SETTINGS, SETTINGS_KEY, normalizeSettings } from '../data/defaultSettings'
import { cartSubtotal, deliveryFeeFor, genOrderId } from '../lib/utils'
import { useI18n } from '../i18n/I18nContext'
import { localizeProduct } from '../i18n/productI18n'

const StoreContext = createContext(null)

const KEYS = {
  products: 'freshmarket.products.v1',
  orders: 'freshmarket.orders.v1',
  cart: 'freshmarket.cart.v1',
  settings: SETTINGS_KEY,
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* kvota to'lgan bo'lsa jim o'tkazamiz */
  }
}

export function StoreProvider({ children }) {
  const { lang } = useI18n()
  /** Mahsulotlar — admin panel bilan umumiy holat */
  const [products, setProducts] = useState(() => {
    const stored = readJSON(KEYS.products, null)
    return Array.isArray(stored) && stored.length ? stored : SEED_PRODUCTS
  })

  /** Buyurtmalar */
  const [orders, setOrders] = useState(() => {
    const stored = readJSON(KEYS.orders, null)
    return Array.isArray(stored) ? stored : SEED_ORDERS
  })

  /** Do'kon sozlamalari — admin panelda tahrirlanadi */
  const [settings, setSettings] = useState(() => normalizeSettings(readJSON(KEYS.settings, null)))

  /** Savat: { [productId]: qty } */
  const [cart, setCart] = useState(() => {
    const stored = readJSON(KEYS.cart, {})
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  })

  /** UI holati */
  const [isCartOpen, setCartOpen] = useState(false)
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const [quickViewId, setQuickViewId] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)
  const [toasts, setToasts] = useState([])
  const toastTimers = useRef(new Map())

  /* ---------- persist ---------- */
  useEffect(() => writeJSON(KEYS.products, products), [products])
  useEffect(() => writeJSON(KEYS.orders, orders), [orders])
  useEffect(() => writeJSON(KEYS.cart, cart), [cart])
  useEffect(() => writeJSON(KEYS.settings, settings), [settings])

  /* ---------- boshqa tab bilan sinxronlash ---------- */
  useEffect(() => {
    const onStorage = (event) => {
      if (!event.key) return
      if (event.key === KEYS.products) {
        const next = readJSON(KEYS.products, null)
        if (Array.isArray(next)) setProducts(next)
      }
      if (event.key === KEYS.orders) {
        const next = readJSON(KEYS.orders, null)
        if (Array.isArray(next)) setOrders(next)
      }
      if (event.key === KEYS.cart) {
        const next = readJSON(KEYS.cart, {})
        if (next && typeof next === 'object') setCart(next)
      }
      if (event.key === KEYS.settings) {
        setSettings(normalizeSettings(readJSON(KEYS.settings, null)))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /* ---------- toast ---------- */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = toastTimers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      toastTimers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (message, tone = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }])
      const timer = setTimeout(() => dismissToast(id), 2600)
      toastTimers.current.set(id, timer)
    },
    [dismissToast],
  )

  /* ---------- savat ---------- */
  const productMap = useMemo(() => {
    const map = new Map()
    products.forEach((p) => map.set(p.id, p))
    return map
  }, [products])

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const product = productMap.get(id)
        if (!product) return null
        return { ...product, qty: Number(qty) || 0 }
      })
      .filter((item) => item && item.qty > 0)
  }, [cart, productMap])

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.qty, 0), [cartItems])
  const subtotal = useMemo(() => cartSubtotal(cartItems), [cartItems])
  const deliveryFee = useMemo(
    () => deliveryFeeFor(subtotal, settings.deliveryFee, settings.freeDeliveryThreshold),
    [subtotal, settings.deliveryFee, settings.freeDeliveryThreshold],
  )
  const total = subtotal + deliveryFee
  const freeDeliveryLeft = Math.max(0, settings.freeDeliveryThreshold - subtotal)
  const freeDeliveryProgress =
    settings.freeDeliveryThreshold > 0
      ? Math.min(100, Math.round((subtotal / settings.freeDeliveryThreshold) * 100))
      : 100

  const addToCart = useCallback(
    (id, qty = 1) => {
      const product = productMap.get(id)
      if (!product || product.stock === 'out') {
        toast('Bu mahsulot hozircha mavjud emas', 'error')
        return
      }
      setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + qty }))
      toast(`${product.name} savatga qo'shildi`)
    },
    [productMap, toast],
  )

  const setQty = useCallback(
    (id, qty) => {
      setCart((prev) => {
        const next = { ...prev }
        if (qty <= 0) delete next[id]
        else next[id] = Math.min(qty, 99)
        return next
      })
    },
    [],
  )

  const increment = useCallback((id) => setQty(id, (cart[id] || 0) + 1), [cart, setQty])
  const decrement = useCallback((id) => setQty(id, (cart[id] || 0) - 1), [cart, setQty])
  const removeFromCart = useCallback((id) => setQty(id, 0), [setQty])
  const clearCart = useCallback(() => setCart({}), [])

  /* ---------- buyurtma ---------- */
  const createOrder = useCallback(
    ({ customer, payment }) => {
      const items = cartItems.map((item) => localizeProduct(item, lang)).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        unit: item.unit,
        image: item.image,
      }))
      const orderSubtotal = cartSubtotal(items)
      const delivery = deliveryFeeFor(
        orderSubtotal,
        settings.deliveryFee,
        settings.freeDeliveryThreshold,
      )

      const order = {
        id: genOrderId(),
        customer,
        items,
        subtotal: orderSubtotal,
        delivery,
        total: orderSubtotal + delivery,
        payment,
        status: 'new',
        createdAt: new Date().toISOString(),
      }

      setOrders((prev) => [order, ...prev])
      setCart({})
      setLastOrder(order)
      return order
    },
    [cartItems, settings.deliveryFee, settings.freeDeliveryThreshold, lang],
  )

  /* ---------- admin: mahsulotlar ---------- */
  const addProduct = useCallback((product) => {
    setProducts((prev) => [
      { ...product, id: product.id || `p-${Date.now().toString(36)}` },
      ...prev,
    ])
  }, [])

  const updateProduct = useCallback((id, patch) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setCart((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const updateOrderStatus = useCallback((id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
  }, [])

  const updateOrder = useCallback((id, patch) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const next = { ...o, ...patch }
        if (patch.customer) next.customer = { ...o.customer, ...patch.customer }
        return next
      }),
    )
  }, [])

  const deleteOrder = useCallback((id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }, [])

  /* ---------- admin: sozlamalar ---------- */
  const updateSettings = useCallback((patch) => {
    setSettings((prev) => normalizeSettings({ ...prev, ...patch }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS })
  }, [])

  const resetDemoData = useCallback(() => {
    setProducts(SEED_PRODUCTS)
    setOrders([])
    setCart({})
    toast("Demo ma'lumotlar tiklandi")
  }, [toast])

  const value = {
    // katalog
    products,
    productMap,
    addProduct,
    updateProduct,
    deleteProduct,
    // sozlamalar
    settings,
    updateSettings,
    resetSettings,
    // savat
    cart,
    cartItems,
    cartCount,
    subtotal,
    deliveryFee,
    total,
    freeDeliveryLeft,
    freeDeliveryProgress,
    addToCart,
    setQty,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    // buyurtmalar
    orders,
    createOrder,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    lastOrder,
    setLastOrder,
    // ui
    isCartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    isCheckoutOpen,
    openCheckout: () => {
      setCartOpen(false)
      setCheckoutOpen(true)
    },
    closeCheckout: () => setCheckoutOpen(false),
    quickViewId,
    openQuickView: (id) => setQuickViewId(id),
    closeQuickView: () => setQuickViewId(null),
    // toast
    toasts,
    toast,
    dismissToast,
    // demo
    resetDemoData,
    constants: {
      DELIVERY_FEE: settings.deliveryFee,
      FREE_DELIVERY_THRESHOLD: settings.freeDeliveryThreshold,
    },
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore faqat StoreProvider ichida ishlaydi')
  return ctx
}
