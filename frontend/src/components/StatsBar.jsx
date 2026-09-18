import { fmtMoney } from '../utils/format'

export default function StatsBar({ stats }) {
  const {
    totalSessions = 0,
    totalExpense = 0,
    totalCollected = 0,
    totalDebt = 0,
  } = stats || {}

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-label">🏸 Buổi Chơi</div>
        <div className="stat-value">{totalSessions}</div>
        <div className="stat-sub">buổi đã ghi nhận</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">💰 Tổng Chi Phí</div>
        <div className="stat-value">{fmtMoney(totalExpense)}</div>
        <div className="stat-sub">tổng tiền sân + cầu</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">✅ Đã Thu</div>
        <div className="stat-value">{fmtMoney(totalCollected)}</div>
        <div className="stat-sub">thành viên đã trả</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">⏳ Còn Nợ</div>
        <div className="stat-value">{fmtMoney(totalDebt)}</div>
        <div className="stat-sub">chưa thanh toán</div>
      </div>
    </div>
  )
}
