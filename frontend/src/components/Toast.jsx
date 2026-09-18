import { useState, useEffect, useCallback } from 'react'

let toastId = 0
let setToastsExternal = null

export function showToast(message, type = 'success') {
  if (setToastsExternal) {
    const id = ++toastId
    setToastsExternal(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToastsExternal(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }
}

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
}

function Toast({ toast }) {
  return (
    <div className={`toast ${toast.type}`}>
      <span className="toast-icon">{ICONS[toast.type] || 'ℹ️'}</span>
      <span className="toast-msg">{toast.message}</span>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    setToastsExternal = setToasts
    return () => { setToastsExternal = null }
  }, [])

  return (
    <div className="toast-container">
      {toasts.map(t => <Toast key={t.id} toast={t} />)}
    </div>
  )
}
