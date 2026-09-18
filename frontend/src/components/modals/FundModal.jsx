import { useState, useEffect } from 'react'
import { fmtMoney } from '../../utils/format'

export default function FundModal({ isOpen, onClose, mode, onConfirm }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setAmount('')
      setNote('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const isAdd = mode === 'add'
  const title = isAdd ? '➕ Nạp Tiền Vào Quỹ' : '➖ Rút Tiền Từ Quỹ'
  const btnClass = isAdd ? 'btn-success' : 'btn-danger'
  const btnText = isAdd ? '✅ Nạp Quỹ' : '✅ Rút Quỹ'

  const handleConfirm = async () => {
    const val = parseFloat(amount)
    if (!val || val <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ.')
      return
    }
    setSaving(true)
    try {
      await onConfirm({ amount: val, note: note.trim() || null })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">💰 Số Tiền (đồng) *</label>
            <input
              type="number"
              className="form-input"
              placeholder="Ví dụ: 500000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              min="1"
              step="1000"
              autoFocus
            />
            {amount && parseFloat(amount) > 0 && (
              <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                = {fmtMoney(parseFloat(amount))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">📝 Ghi Chú</label>
            <input
              type="text"
              className="form-input"
              placeholder={isAdd ? 'Lý do nạp tiền...' : 'Lý do rút tiền...'}
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Hủy</button>
          <button
            className={`btn ${btnClass}`}
            onClick={handleConfirm}
            disabled={saving || !amount || parseFloat(amount) <= 0}
          >
            {saving ? '⏳ Đang xử lý...' : btnText}
          </button>
        </div>
      </div>
    </div>
  )
}
