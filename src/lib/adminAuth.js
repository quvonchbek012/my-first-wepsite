import { ADMIN_PASSWORD } from '../config/brand'

const PASSWORD_KEY = 'freshmarket.admin.password.v1'
const SESSION_KEY = 'freshmarket.admin.session'

/** Joriy admin paroli (demo: config/brand.js dagi qiymat). */
export function getAdminPassword() {
  try {
    return localStorage.getItem(PASSWORD_KEY) || ADMIN_PASSWORD
  } catch {
    return ADMIN_PASSWORD
  }
}

export function verifyAdminPassword(value) {
  return String(value || '') === getAdminPassword()
}

export function changeAdminPassword(next) {
  const value = String(next || '').trim()
  if (value.length < 5) return { ok: false, error: "Parol kamida 5 belgidan iborat bo'lishi kerak" }
  try {
    localStorage.setItem(PASSWORD_KEY, value)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Parolni saqlab bo‘lmadi (brauzer xotirasi cheklangan)' }
  }
}

/** Demo parol hali o'zgartirilmaganini bildiradi. */
export function isDefaultPassword() {
  return getAdminPassword() === ADMIN_PASSWORD
}

export function startAdminSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function hasAdminSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function endAdminSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}
