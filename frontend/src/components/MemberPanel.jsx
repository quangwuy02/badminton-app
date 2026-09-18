import { fmtMoney, getInitials } from '../utils/format'

export default function MemberPanel({
  members,
  onMarkPaid,
  fund,
  onAddFund,
  onWithdrawFund,
}) {
  const totalDebt = members.reduce((sum, m) => sum + Math.max(0, m.totalDebt || 0), 0)

  return (
    <div className="members-panel">
      {/* Fund card */}
      <div className="fund-section">
        <div className="fund-title">💼 Quỹ Nhóm</div>
        <div className="fund-balance">{fmtMoney(fund?.balance ?? 0)}</div>
        <div className="fund-actions">
          <button className="btn" onClick={onAddFund}>
            ➕ Nạp Quỹ
          </button>
          <button className="btn" onClick={onWithdrawFund}>
            ➖ Rút Quỹ
          </button>
        </div>
      </div>

      {/* Members card */}
      <div className="panel" style={{ flex: 1 }}>
        <div className="panel-header">
          <div className="panel-title">
            👥 Thành Viên
            <span className="badge badge-primary">{members.length}</span>
          </div>
          {totalDebt > 0 && (
            <span className="badge badge-danger">Nợ: {fmtMoney(totalDebt)}</span>
          )}
        </div>
        <div className="panel-body" style={{ padding: '12px 16px' }}>
          {members.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-state-icon">👤</div>
              <p>Chưa có thành viên</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map(member => {
                const debt = member.totalDebt || 0
                const isDebt = debt > 0
                return (
                  <div key={member.id} className="member-item">
                    <div
                      className="member-avatar"
                      style={{ background: member.color || '#4f46e5' }}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div
                        className={`member-balance ${
                          isDebt ? 'balance-debt' : debt < 0 ? 'balance-paid' : 'balance-zero'
                        }`}
                      >
                        {isDebt
                          ? `Nợ: ${fmtMoney(debt)}`
                          : debt < 0
                          ? `Dư: ${fmtMoney(Math.abs(debt))}`
                          : 'Đã thanh toán'}
                      </div>
                    </div>
                    <div className="member-actions">
                      {isDebt && (
                        <button
                          className="btn btn-success btn-xs"
                          onClick={() => onMarkPaid(member)}
                          title="Đánh dấu đã thu tiền"
                        >
                          ✓ Thu
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
