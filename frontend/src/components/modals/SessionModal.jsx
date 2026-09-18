import { useState, useEffect } from 'react'
import { fmtMoney, getInitials } from '../../utils/format'

const today = () => new Date().toISOString().split('T')[0]

export default function SessionModal({ isOpen, onClose, onSave, members, editSession }) {
  const [form, setForm] = useState({
    date: today(),
    startTime: '06:00',
    endTime: '',
    courtFee: '',
    shuttleFee: '',
    note: '',
    attendeeIds: [],
  })
  const [saving, setSaving] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (!isOpen) return
    if (editSession) {
      setForm({
        date: editSession.date || today(),
        startTime: editSession.startTime || '06:00',
        endTime: editSession.endTime || '',
        courtFee: editSession.courtFee ?? '',
        shuttleFee: editSession.shuttleFee ?? '',
        note: editSession.note || '',
        attendeeIds: (editSession.attendees || []).map(a => a.memberId ?? a.id),
      })
    } else {
      setForm({
        date: today(),
        startTime: '06:00',
        endTime: '',
        courtFee: '',
        shuttleFee: '',
        note: '',
        attendeeIds: members.map(m => m.id), // default: all selected
      })
    }
  }, [isOpen, editSession, members])

  if (!isOpen) return null

  const courtFeeNum = parseFloat(form.courtFee) || 0
  const shuttleFeeNum = parseFloat(form.shuttleFee) || 0
  const total = courtFeeNum + shuttleFeeNum
  const count = form.attendeeIds.length
  const perPerson = count > 0 ? Math.round(total / count) : 0

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      attendeeIds: f.attendeeIds.includes(id)
        ? f.attendeeIds.filter(x => x !== id)
        : [...f.attendeeIds, id],
    }))
  }

  const selectAll = () => setForm(f => ({ ...f, attendeeIds: members.map(m => m.id) }))
  const deselectAll = () => setForm(f => ({ ...f, attendeeIds: [] }))

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.date) return
    if (form.attendeeIds.length === 0) {
      alert('Vui lòng chọn ít nhất một thành viên.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        date: form.date,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        courtFee: courtFeeNum,
        shuttleFee: shuttleFeeNum,
        note: form.note || null,
        attendeeIds: form.attendeeIds,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">
            {editSession ? '✏️ Sửa Buổi Chơi' : '➕ Thêm Buổi Chơi'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
          <div className="modal-body">
            {/* Date & Time */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">📅 Ngày Chơi *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.date}
                  onChange={e => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">🕐 Giờ Bắt Đầu</label>
                <input
                  type="time"
                  className="form-input"
                  value={form.startTime}
                  onChange={e => handleChange('startTime', e.target.value)}
                />
              </div>
            </div>

            {/* Fees */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🏟️ Tiền Sân (đồng)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ví dụ: 200000"
                  value={form.courtFee}
                  onChange={e => handleChange('courtFee', e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">🏸 Tiền Cầu (đồng)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ví dụ: 100000"
                  value={form.shuttleFee}
                  onChange={e => handleChange('shuttleFee', e.target.value)}
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            {/* Note */}
            <div className="form-group">
              <label className="form-label">📝 Ghi Chú</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ghi chú về buổi chơi..."
                value={form.note}
                onChange={e => handleChange('note', e.target.value)}
              />
            </div>

            {/* Member selector */}
            <div className="form-group">
              <div className="members-section-title">
                <span>👥 Thành Viên Tham Gia ({form.attendeeIds.length}/{members.length})</span>
                <div className="members-select-actions">
                  <button type="button" className="btn btn-outline btn-xs" onClick={selectAll}>Tất cả</button>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={deselectAll}>Bỏ chọn</button>
                </div>
              </div>
              <div className="member-checkbox-grid">
                {members.map(member => (
                  <div key={member.id} className="member-checkbox-item">
                    <input
                      type="checkbox"
                      id={`m-${member.id}`}
                      checked={form.attendeeIds.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                    />
                    <label htmlFor={`m-${member.id}`} className="member-checkbox-label">
                      <div
                        className="member-checkbox-avatar"
                        style={{ background: member.color || '#4f46e5' }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <span className="member-checkbox-name">{member.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Preview */}
            {(courtFeeNum > 0 || shuttleFeeNum > 0) && (
              <div className="cost-preview">
                <div className="cost-preview-row">
                  <span>Tiền sân</span>
                  <span>{fmtMoney(courtFeeNum)}</span>
                </div>
                <div className="cost-preview-row">
                  <span>Tiền cầu</span>
                  <span>{fmtMoney(shuttleFeeNum)}</span>
                </div>
                <div className="cost-preview-row">
                  <span>Số người</span>
                  <span>{count} người</span>
                </div>
                <div className="cost-preview-total">
                  <span>💰 Mỗi người đóng</span>
                  <span>{count > 0 ? fmtMoney(perPerson) : '—'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Đang lưu...' : editSession ? '💾 Cập Nhật' : '✅ Thêm Buổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
