import { useState, useEffect, useCallback } from 'react'

// API
import { getMembers, addMember, deleteMember, markAllPaid } from './api/memberApi'
import { getSessions, createSession, updateSession, deleteSession, togglePayment, getStats } from './api/sessionApi'
import { getFund, addFund, withdrawFund } from './api/fundApi'

// Components
import Header from './components/Header'
import StatsBar from './components/StatsBar'
import SessionList from './components/SessionList'
import MemberPanel from './components/MemberPanel'
import { ToastContainer, showToast } from './components/Toast'

// Modals
import SessionModal from './components/modals/SessionModal'
import DetailModal from './components/modals/DetailModal'
import MemberModal from './components/modals/MemberModal'
import FundModal from './components/modals/FundModal'

export default function App() {
  // Data state
  const [members, setMembers] = useState([])
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState({})
  const [fund, setFund] = useState({ balance: 0 })

  // Filter
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  // Modal state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isFundModalOpen, setIsFundModalOpen] = useState(false)
  const [fundMode, setFundMode] = useState('add') // 'add' | 'withdraw'

  // Selected / edit session
  const [selectedSession, setSelectedSession] = useState(null)
  const [editSession, setEditSession] = useState(null)

  // ============================================================
  // Load data
  // ============================================================
  const loadMembers = useCallback(async () => {
    try {
      const data = await getMembers()
      setMembers(data)
    } catch (err) {
      console.error('Failed to load members', err)
    }
  }, [])

  const loadSessions = useCallback(async (month) => {
    try {
      const data = await getSessions(month || undefined)
      setSessions(data)
    } catch (err) {
      console.error('Failed to load sessions', err)
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats', err)
    }
  }, [])

  const loadFund = useCallback(async () => {
    try {
      const data = await getFund()
      setFund(data)
    } catch (err) {
      console.error('Failed to load fund', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadMembers()
    loadStats()
    loadFund()
  }, [loadMembers, loadStats, loadFund])

  // Reload sessions when filter changes
  useEffect(() => {
    loadSessions(filterMonth)
  }, [filterMonth, loadSessions])

  // ============================================================
  // Member handlers
  // ============================================================
  const handleAddMember = async (data) => {
    try {
      await addMember(data)
      await loadMembers()
      showToast(`Đã thêm thành viên "${data.name}"`, 'success')
    } catch (err) {
      showToast('Không thể thêm thành viên', 'error')
      throw err
    }
  }

  const handleDeleteMember = async (id) => {
    try {
      await deleteMember(id)
      await loadMembers()
      showToast('Đã xóa thành viên', 'success')
    } catch (err) {
      showToast('Không thể xóa thành viên', 'error')
    }
  }

  const handleMarkPaid = async (member) => {
    if (!window.confirm(`Thu tất cả nợ của "${member.name}" (${member.totalDebt?.toLocaleString('vi-VN')}đ)?`)) return
    try {
      await markAllPaid(member.id)
      await loadMembers()
      await loadStats()
      showToast(`Đã thu tiền của ${member.name}`, 'success')
    } catch (err) {
      showToast('Không thể cập nhật', 'error')
    }
  }

  // ============================================================
  // Session handlers
  // ============================================================
  const handleSaveSession = async (data) => {
    try {
      if (editSession) {
        await updateSession(editSession.id, data)
        showToast('Đã cập nhật buổi chơi', 'success')
      } else {
        await createSession(data)
        showToast('Đã thêm buổi chơi mới', 'success')
      }
      await Promise.all([loadSessions(filterMonth), loadStats(), loadMembers()])
    } catch (err) {
      showToast('Không thể lưu buổi chơi', 'error')
      throw err
    }
  }

  const handleDeleteSession = async (id) => {
    try {
      await deleteSession(id)
      await Promise.all([loadSessions(filterMonth), loadStats(), loadMembers()])
      showToast('Đã xóa buổi chơi', 'success')
    } catch (err) {
      showToast('Không thể xóa buổi chơi', 'error')
    }
  }

  const handleTogglePayment = async (sessionId, memberId) => {
    try {
      const updated = await togglePayment(sessionId, memberId)
      // Update the selected session in place for instant feedback
      setSelectedSession(updated)
      // Also refresh list + stats
      await Promise.all([loadSessions(filterMonth), loadStats(), loadMembers()])
    } catch (err) {
      showToast('Không thể cập nhật thanh toán', 'error')
    }
  }

  const handleSessionClick = (session) => {
    setSelectedSession(session)
    setIsDetailModalOpen(true)
  }

  const handleOpenAddSession = () => {
    setEditSession(null)
    setIsSessionModalOpen(true)
  }

  const handleEditSession = (session) => {
    setEditSession(session)
    setIsSessionModalOpen(true)
  }

  // ============================================================
  // Fund handlers
  // ============================================================
  const handleOpenAddFund = () => { setFundMode('add'); setIsFundModalOpen(true) }
  const handleOpenWithdrawFund = () => { setFundMode('withdraw'); setIsFundModalOpen(true) }

  const handleFundConfirm = async (data) => {
    try {
      if (fundMode === 'add') {
        await addFund(data)
        showToast('Đã nạp tiền vào quỹ', 'success')
      } else {
        await withdrawFund(data)
        showToast('Đã rút tiền từ quỹ', 'success')
      }
      await loadFund()
    } catch (err) {
      showToast('Không thể cập nhật quỹ', 'error')
      throw err
    }
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <>
      <div className="app-container">
        <Header
          onManageMembers={() => setIsMemberModalOpen(true)}
          onAddSession={handleOpenAddSession}
        />

        <StatsBar stats={stats} />

        <div className="main-grid">
          <SessionList
            sessions={sessions}
            onSessionClick={handleSessionClick}
            onMonthChange={setFilterMonth}
            filterMonth={filterMonth}
          />
          <MemberPanel
            members={members}
            onMarkPaid={handleMarkPaid}
            fund={fund}
            onAddFund={handleOpenAddFund}
            onWithdrawFund={handleOpenWithdrawFund}
          />
        </div>
      </div>

      {/* Modals */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => { setIsSessionModalOpen(false); setEditSession(null) }}
        onSave={handleSaveSession}
        members={members}
        editSession={editSession}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedSession(null) }}
        session={selectedSession}
        onTogglePayment={handleTogglePayment}
        onDelete={handleDeleteSession}
        onEdit={handleEditSession}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={members}
        onAdd={handleAddMember}
        onDelete={handleDeleteMember}
      />

      <FundModal
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        mode={fundMode}
        onConfirm={handleFundConfirm}
      />

      <ToastContainer />
    </>
  )
}
