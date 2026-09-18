import { useState } from 'react'
import { getInitials } from '../../utils/format'

const COLORS = [
  '#4f46e5','#059669','#dc2626','#d97706',
  '#7c3aed','#0891b2','#be185d','#65a30d',
]

export default function MemberModal({ isOpen, onClose, members, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)

  if (!isOpen) return null

  const handleAdd = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setAdding(true)
    try {
      const color = COLORS[members.length % COLORS.length]
      await onAdd({ name: trimmed, color })
      setName('')
    } finally {
      setAdding(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }

  const handleDelete = (member) => {
    if (window.confirm(`Xóa thành viên "${member.name}"? Dữ liệu liên quan sẽ bị ảnh hưởng.`)) {
      onDelete(member.id)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <div className="modal-title">👥 Quản Lý Thành Viên</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="add-member-row">
            <input
              type="text"
              className="form-input"
              placeholder="Tên thành viên mới..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={adding || !name.trim()}
            >
              {adding ? '⏳' : '➕ Thêm'}
            </button>
          </div>

          {members.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">👤</div>
              <p>Chưa có thành viên nào</p>
            </div>
          ) : (
            <div>
              {members.map(member => (
                <div key={member.id} className="member-list-item">
                  <div
                    className="member-avatar"
                    style={{ background: member.color || '#4f46e5' }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <span className="member-list-name">{member.name}</span>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={() => handleDelete(member)}
                    title="Xóa thành viên"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  )
}
