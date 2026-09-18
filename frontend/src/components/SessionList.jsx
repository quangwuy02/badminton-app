import SessionCard from './SessionCard'

export default function SessionList({ sessions, onSessionClick, onMonthChange, filterMonth }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          📋 Danh Sách Buổi Chơi
          <span className="badge badge-primary">{sessions.length}</span>
        </div>
        <div className="month-filter">
          <label htmlFor="month-filter">Tháng:</label>
          <input
            id="month-filter"
            type="month"
            className="month-input"
            value={filterMonth}
            onChange={e => onMonthChange(e.target.value)}
          />
          {filterMonth && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onMonthChange('')}
              title="Xóa bộ lọc"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="panel-body">
        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏸</div>
            <p>Chưa có buổi chơi nào{filterMonth ? ' trong tháng này' : ''}.</p>
            <p style={{ marginTop: 8, fontSize: '0.82rem' }}>
              Nhấn <strong>+ Thêm Buổi</strong> để ghi nhận buổi đầu tiên!
            </p>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => onSessionClick(session)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
