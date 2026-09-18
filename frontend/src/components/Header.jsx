export default function Header({ onManageMembers, onAddSession }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">🏸</span>
        <div className="header-title">
          <h1>Quản Lý Thu Chi Cầu Lông</h1>
          <p>Theo dõi chi phí sân và cầu lông</p>
        </div>
      </div>
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onManageMembers}>
          👥 Thành Viên
        </button>
        <button className="btn btn-primary" onClick={onAddSession}>
          ➕ Thêm Buổi
        </button>
      </div>
    </header>
  )
}
