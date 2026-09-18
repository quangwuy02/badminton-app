import { fmtMoney, fmtDate, getInitials } from '../../utils/format'

export default function DetailModal({
  isOpen,
  onClose,
  session,
  onTogglePayment,
  onDelete,
  onEdit,
}) {
  if (!isOpen || !session) return null

  const {
    date,
    startTime,
    endTime,
    courtFee = 0,
    shuttleFee = 0,
    attendees = [],
    note,
  } = session

  const total = courtFee + shuttleFee
  const count = attendees.length
  const perPerson = count > 0 ? Math.round(total / count) : 0
  const paidCount = attendees.filter(a => a.paid).length

  const timeStr = startTime
    ? endTime ? `${startTime} – ${endTime}` : startTime
    : null

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa buổi chơi này?')) {
      onDelete(session.id)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">
            <span>📋</span>
            <span>
              {fmtDate(date)}
              {timeStr && <span style={{ fontSize: '0.85rem', fontWeight: 400, marginLeft: 8, color: 'var(--text-secondary)' }}>🕐 {timeStr}</span>}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {note && (
            <div className="note-text mb-3">📝 {note}</div>
          )}

          {/* Detail Grid */}
          <div className="detail-grid">
            <div className="detail-card">
              <div className="detail-card-label">🏟️ Tiền Sân</div>
              <div className="detail-card-value">{fmtMoney(courtFee)}</div>
            </div>
            <div className="detail-card">
              <div className="detail-card-label">🏸 Tiền Cầu</div>
              <div className="detail-card-value">{fmtMoney(shuttleFee)}</div>
            </div>
            <div className="detail-card">
              <div className="detail-card-label">💰 Tổng Chi Phí</div>
              <div className="detail-card-value accent">{fmtMoney(total)}</div>
            </div>
            <div className="detail-card">
              <div className="detail-card-label">👤 Mỗi Người</div>
              <div className="detail-card-value success">{fmtMoney(perPerson)}</div>
            </div>
          </div>

          {/* Payment status summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="section-divider" style={{ flex: 1, marginBottom: 0, marginRight: 12 }}>
              Danh Sách Thanh Toán ({paidCount}/{count})
            </div>
            <span className={`badge ${paidCount === count && count > 0 ? 'badge-success' : 'badge-warning'}`}>
              {paidCount === count && count > 0 ? '✅ Hoàn tất' : `⏳ ${count - paidCount} chưa trả`}
            </span>
          </div>

          {/* Attendee list */}
          <div className="attendee-list">
            {attendees.map(attendee => (
              <div
                key={attendee.memberId ?? attendee.id}
                className={`attendee-item ${attendee.paid ? 'paid' : 'unpaid'}`}
              >
                <div
                  className="member-avatar"
                  style={{
                    width: 32, height: 32, fontSize: '0.8rem',
                    background: attendee.color || '#4f46e5',
                  }}
                >
                  {getInitials(attendee.memberName || attendee.name || '?')}
                </div>
                <span className="attendee-name">{attendee.memberName || attendee.name}</span>
                <span className={`attendee-status ${attendee.paid ? 'paid' : 'unpaid'}`}>
                  {attendee.paid ? '✅ Đã trả' : '❌ Chưa trả'}
                </span>
                <button
                  className={`btn btn-xs ${attendee.paid ? 'btn-ghost' : 'btn-success'}`}
                  onClick={() => onTogglePayment(session.id, attendee.memberId ?? attendee.id)}
                >
                  {attendee.paid ? 'Hoàn tác' : 'Thu tiền'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑️ Xóa
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(session) }}>
            ✏️ Sửa
          </button>
        </div>
      </div>
    </div>
  )
}
