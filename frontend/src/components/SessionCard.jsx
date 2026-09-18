import { fmtMoney, fmtDate } from '../utils/format'
import { getInitials } from '../utils/format'

export default function SessionCard({ session, onClick }) {
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
  const paidPct = count > 0 ? Math.round((paidCount / count) * 100) : 0

  const timeStr = startTime
    ? endTime ? `${startTime} - ${endTime}` : startTime
    : ''

  return (
    <div className="session-card" onClick={onClick} title="Nhấn để xem chi tiết">
      <div className="session-card-header">
        <div>
          <div className="session-date">{fmtDate(date)}</div>
          {timeStr && <div className="session-time">🕐 {timeStr}</div>}
          {note && <div className="session-time" style={{ marginTop: 2 }}>📝 {note}</div>}
        </div>
        <span className="session-badge">
          👥 {count} người
        </span>
      </div>

      <div className="session-card-body">
        <div className="session-stat">
          <div className="session-stat-value">{fmtMoney(courtFee)}</div>
          <div className="session-stat-label">Tiền Sân</div>
        </div>
        <div className="session-stat">
          <div className="session-stat-value">{fmtMoney(shuttleFee)}</div>
          <div className="session-stat-label">Tiền Cầu</div>
        </div>
        <div className="session-stat">
          <div className="session-stat-value" style={{ color: 'var(--primary)' }}>{fmtMoney(perPerson)}</div>
          <div className="session-stat-label">/ Người</div>
        </div>
      </div>

      <div className="session-card-footer">
        <div className="payment-progress">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <span className="payment-text">
            {paidCount}/{count} đã trả
          </span>
        </div>
        <span
          className={`badge ${paidCount === count && count > 0 ? 'badge-success' : 'badge-warning'}`}
          style={{ marginLeft: 10 }}
        >
          {paidCount === count && count > 0 ? '✓ Xong' : `${paidPct}%`}
        </span>
      </div>
    </div>
  )
}
