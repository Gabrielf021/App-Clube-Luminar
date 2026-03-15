import { useState, useCallback } from 'react'

let toastFn = null

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  toastFn = useCallback((msg, type = 'info', duration = 3000) => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), duration)
  }, [])

  return (
    <>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  )
}

export const showToast = (msg, type = 'info', duration = 3000) => {
  if (toastFn) toastFn(msg, type, duration)
}
