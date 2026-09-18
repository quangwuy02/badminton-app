// =============================================
//  BADMINTON EXPENSE MANAGER - app.js
// =============================================

// ---- State ----
let state = {
  members: [],
  sessions: [],
  fund: 0,
  fundHistory: [],
  editingSessionId: null,
};

const COLORS = [
  '#4f46e5','#059669','#dc2626','#d97706','#7c3aed',
  '#0891b2','#be185d','#65a30d','#ea580c','#0284c7',
];

// ---- Persistence ----
function save() { localStorage.setItem('badminton_app', JSON.stringify(state)); }
function load() {
  const raw = localStorage.getItem('badminton_app');
  if (raw) {
    try { state = JSON.parse(raw); }
    catch(e) { console.error('Load error', e); }
  } else {
    // Default 8 members
    state.members = [
      {id:uid(), name:'Minh', color: COLORS[0]},
      {id:uid(), name:'Hùng', color: COLORS[1]},
      {id:uid(), name:'Tuấn', color: COLORS[2]},
      {id:uid(), name:'Nam', color: COLORS[3]},
      {id:uid(), name:'Huy', color: COLORS[4]},
      {id:uid(), name:'Dũng', color: COLORS[5]},
      {id:uid(), name:'Long', color: COLORS[6]},
      {id:uid(), name:'Phong', color: COLORS[7]},
    ];
  }
}

// ---- Helpers ----
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function fmtMoney(n) {
  if (!n && n !== 0) return '0đ';
  if (Math.abs(n) >= 1_000_000) return (n/1_000_000).toFixed(1).replace(/\.0$/,'') + 'M đ';
  if (Math.abs(n) >= 1_000) return Math.round(n/1000) + 'K đ';
  return n.toLocaleString('vi-VN') + 'đ';
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['CN','T2','T3','T4','T5','T6','T7'];
  return days[d.getDay()] + ' ' + d.toLocaleDateString('vi-VN');
}

function fmtDateLong(dateStr, timeStr) {
  let out = fmtDate(dateStr);
  if (timeStr) out += ' lúc ' + timeStr;
  return out;
}

function avatar(member) {
  return `<div class="member-avatar" style="background:${member.color}">${member.name.slice(0,1).toUpperCase()}</div>`;
}

function initials(name) { return name.slice(0,1).toUpperCase(); }

function showToast(msg, type='') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  setTimeout(() => el.className = 'toast', 2800);
}

// ---- Member balance computation ----
function computeBalances() {
  // balance: positive = they owe money, negative = they have credit
  const bal = {};
  state.members.forEach(m => bal[m.id] = 0);

  state.sessions.forEach(s => {
    const share = Math.round(s.totalCost / s.attendees.length);
    s.attendees.forEach(mid => {
      if (bal[mid] === undefined) bal[mid] = 0;
      if (!s.paidStatus || !s.paidStatus[mid]) {
        bal[mid] += share;  // unpaid -> owes
      }
    });
  });
  return bal;
}

// ---- Summary stats ----
function computeStats() {
  const filtered = filteredSessions();
  const total = filtered.reduce((a, s) => a + s.totalCost, 0);
  
  let collected = 0;
  let debt = 0;
  state.sessions.forEach(s => {
    const share = Math.round(s.totalCost / s.attendees.length);
    s.attendees.forEach(mid => {
      if (s.paidStatus && s.paidStatus[mid]) collected += share;
      else debt += share;
    });
  });

  document.getElementById('totalSessions').textContent = filtered.length;
  document.getElementById('totalExpense').textContent = fmtMoney(total);
  document.getElementById('totalCollected').textContent = fmtMoney(collected);
  document.getElementById('totalDebt').textContent = fmtMoney(debt);
  document.getElementById('fundAmount').textContent = fmtMoney(state.fund || 0);
}

// ---- Filter ----
function filteredSessions() {
  const month = document.getElementById('filterMonth').value;
  if (!month) return [...state.sessions].reverse();
  return [...state.sessions].filter(s => s.date && s.date.startsWith(month)).reverse();
}

// ---- Render Sessions List ----
function renderSessions() {
  const list = document.getElementById('sessionsList');
  const sessions = filteredSessions();

  if (!sessions.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">🏸</div><p>Không có buổi chơi nào</p><p class="empty-sub">Thêm buổi mới hoặc thay đổi bộ lọc</p></div>`;
    return;
  }

  list.innerHTML = sessions.map(s => {
    const perPerson = s.attendees.length ? Math.round(s.totalCost / s.attendees.length) : 0;
    const names = s.attendees.map(mid => {
      const m = state.members.find(x => x.id === mid);
      return m ? m.name : '?';
    }).join(', ');
    const paidCount = s.attendees.filter(mid => s.paidStatus && s.paidStatus[mid]).length;

    return `<div class="session-card" data-id="${s.id}">
      <div class="session-card-header">
        <div>
          <div class="session-date-time">${fmtDate(s.date)} ${s.time || ''}</div>
          ${s.note ? `<div class="session-date-sub">📌 ${s.note}</div>` : ''}
        </div>
        <div class="session-total">${fmtMoney(s.totalCost)}</div>
      </div>
      <div class="session-card-body">
        <span class="session-fee-item">🏟️ ${fmtMoney(s.courtFee)}</span>
        <span class="session-fee-item">🏸 ${fmtMoney(s.shuttleFee)}</span>
        <span class="session-fee-item">👥 ${s.attendees.length} người</span>
      </div>
      <div>
        <span class="session-per-person">Mỗi người: ${fmtMoney(perPerson)}</span>
        <span class="session-attendees">Đã thu: ${paidCount}/${s.attendees.length} · ${names}</span>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.session-card').forEach(card => {
    card.addEventListener('click', () => openDetailModal(card.dataset.id));
  });

  computeStats();
}

// ---- Render Members ----
function renderMembers() {
  const bal = computeBalances();
  const list = document.getElementById('membersList');

  if (!state.members.length) {
    list.innerHTML = `<div style="padding:16px;text-align:center;color:var(--gray-400)">Chưa có thành viên</div>`;
    return;
  }

  list.innerHTML = state.members.map(m => {
    const debt = bal[m.id] || 0;
    const cls = debt > 0 ? 'owe' : debt < 0 ? 'paid' : 'zero';
    const label = debt > 0 ? `Nợ ${fmtMoney(debt)}` : debt < 0 ? `Dư ${fmtMoney(-debt)}` : 'Đã thanh toán';
    return `<div class="member-balance-card">
      <div class="member-name">
        <div class="member-avatar" style="background:${m.color}">${initials(m.name)}</div>
        ${m.name}
      </div>
      <div class="member-actions">
        <span class="member-debt ${cls}">${label}</span>
        ${debt > 0 ? `<button class="btn-mark-paid" data-mid="${m.id}">✓ Thu</button>` : ''}
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.btn-mark-paid').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      markAllPaid(btn.dataset.mid);
    });
  });
}

function markAllPaid(memberId) {
  state.sessions.forEach(s => {
    if (s.attendees.includes(memberId)) {
      if (!s.paidStatus) s.paidStatus = {};
      s.paidStatus[memberId] = true;
    }
  });
  save();
  renderSessions();
  renderMembers();
  showToast('Đã đánh dấu thanh toán ✓', 'success');
}

// ---- Members Manage Modal ----
function renderMembersManage() {
  const list = document.getElementById('membersManageList');
  if (!state.members.length) {
    list.innerHTML = `<div style="text-align:center;color:var(--gray-400);padding:12px">Chưa có thành viên nào</div>`;
    return;
  }
  list.innerHTML = state.members.map((m, i) => `
    <div class="member-manage-item">
      <div class="member-manage-name">
        <div class="member-avatar" style="background:${m.color}">${initials(m.name)}</div>
        ${m.name}
      </div>
      <button class="btn-remove" data-idx="${i}" title="Xóa">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      const m = state.members[idx];
      if (!confirm(`Xóa thành viên "${m.name}"?`)) return;
      state.members.splice(idx, 1);
      save();
      renderMembersManage();
      renderMembers();
      showToast(`Đã xóa ${m.name}`, 'error');
    });
  });
}

// ---- Session Modal ----
function openSessionModal(editId = null) {
  state.editingSessionId = editId;
  const title = document.getElementById('modalSessionTitle');
  const saveBtn = document.getElementById('btnSaveSession');

  if (editId) {
    const s = state.sessions.find(x => x.id === editId);
    if (!s) return;
    title.textContent = '✏️ Sửa Buổi Chơi';
    saveBtn.textContent = 'Cập Nhật';
    document.getElementById('sessionDate').value = s.date || '';
    document.getElementById('sessionTime').value = s.time || '07:00';
    document.getElementById('courtFee').value = s.courtFee || '';
    document.getElementById('shuttleFee').value = s.shuttleFee || '';
    document.getElementById('sessionNote').value = s.note || '';
    renderAttendeesCheckboxes(s.attendees);
  } else {
    title.textContent = '➕ Thêm Buổi Chơi';
    saveBtn.textContent = 'Lưu Buổi';
    const today = new Date().toISOString().slice(0,10);
    document.getElementById('sessionDate').value = today;
    document.getElementById('sessionTime').value = '07:00';
    document.getElementById('courtFee').value = '';
    document.getElementById('shuttleFee').value = '';
    document.getElementById('sessionNote').value = '';
    renderAttendeesCheckboxes(state.members.map(m => m.id)); // default all
  }

  updateCostPreview();
  openModal('modalSession');
}

function renderAttendeesCheckboxes(selected = []) {
  const container = document.getElementById('attendeesCheck');
  if (!state.members.length) {
    container.innerHTML = `<div style="color:var(--gray-400);font-size:.85rem">Chưa có thành viên. Thêm thành viên trước.</div>`;
    return;
  }
  container.innerHTML = state.members.map(m => {
    const isSel = selected.includes(m.id);
    return `<div class="member-check-item ${isSel ? 'selected' : ''}" data-mid="${m.id}">
      <div class="member-check-avatar" style="background:${m.color}">${initials(m.name)}</div>
      <div class="member-check-name">${m.name}</div>
      <div class="member-check-tick">✓</div>
    </div>`;
  }).join('');

  container.querySelectorAll('.member-check-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
      updateCostPreview();
    });
  });
  updateCostPreview();
}

function getSelectedAttendees() {
  return [...document.querySelectorAll('#attendeesCheck .member-check-item.selected')]
    .map(el => el.dataset.mid);
}

function updateCostPreview() {
  const court = parseFloat(document.getElementById('courtFee').value) || 0;
  const shuttle = parseFloat(document.getElementById('shuttleFee').value) || 0;
  const total = court + shuttle;
  const count = getSelectedAttendees().length;
  const per = count > 0 ? Math.round(total / count) : 0;

  document.getElementById('previewTotal').textContent = fmtMoney(total);
  document.getElementById('previewPerPerson').textContent = fmtMoney(per);
  document.getElementById('attendeeCount').textContent = count + ' người';
}

function saveSession() {
  const date = document.getElementById('sessionDate').value;
  const time = document.getElementById('sessionTime').value;
  const courtFee = parseFloat(document.getElementById('courtFee').value) || 0;
  const shuttleFee = parseFloat(document.getElementById('shuttleFee').value) || 0;
  const note = document.getElementById('sessionNote').value.trim();
  const attendees = getSelectedAttendees();

  if (!date) { showToast('Vui lòng chọn ngày chơi', 'error'); return; }
  if (!attendees.length) { showToast('Chọn ít nhất 1 người tham gia', 'error'); return; }
  if (courtFee + shuttleFee <= 0) { showToast('Vui lòng nhập chi phí', 'error'); return; }

  const totalCost = courtFee + shuttleFee;

  if (state.editingSessionId) {
    const s = state.sessions.find(x => x.id === state.editingSessionId);
    if (s) {
      // Keep existing paidStatus for members still in session
      const newPaidStatus = {};
      attendees.forEach(mid => {
        if (s.paidStatus && s.paidStatus[mid]) newPaidStatus[mid] = true;
      });
      Object.assign(s, { date, time, courtFee, shuttleFee, totalCost, attendees, note, paidStatus: newPaidStatus });
    }
    showToast('Đã cập nhật buổi chơi ✓', 'success');
  } else {
    const paidStatus = {};
    const newSession = { id: uid(), date, time, courtFee, shuttleFee, totalCost, attendees, note, paidStatus };
    state.sessions.push(newSession);
    showToast('Đã thêm buổi chơi ✓', 'success');
  }

  save();
  closeModal('modalSession');
  renderSessions();
  renderMembers();
}

// ---- Detail Modal ----
function openDetailModal(sessionId) {
  const s = state.sessions.find(x => x.id === sessionId);
  if (!s) return;
  state.editingSessionId = sessionId;

  document.getElementById('detailTitle').textContent = `📋 ${fmtDateLong(s.date, s.time)}`;

  const perPerson = s.attendees.length ? Math.round(s.totalCost / s.attendees.length) : 0;

  const detailBody = document.getElementById('detailBody');
  detailBody.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <label>🏟️ Tiền Sân</label>
        <div class="val">${fmtMoney(s.courtFee)}</div>
      </div>
      <div class="detail-item">
        <label>🏸 Tiền Cầu</label>
        <div class="val">${fmtMoney(s.shuttleFee)}</div>
      </div>
      <div class="detail-item">
        <label>💰 Tổng Chi Phí</label>
        <div class="val" style="color:var(--primary)">${fmtMoney(s.totalCost)}</div>
      </div>
      <div class="detail-item">
        <label>👤 Mỗi Người</label>
        <div class="val" style="color:var(--success)">${fmtMoney(perPerson)}</div>
      </div>
    </div>
    ${s.note ? `<div style="margin-bottom:14px;font-size:.85rem;color:var(--gray-600)">📌 ${s.note}</div>` : ''}
    <div class="detail-payments">
      <h4>💳 Trạng Thái Thanh Toán</h4>
      <div class="payment-list" id="paymentList">
        ${s.attendees.map(mid => {
          const m = state.members.find(x => x.id === mid);
          if (!m) return '';
          const paid = s.paidStatus && s.paidStatus[mid];
          return `<div class="payment-item" data-mid="${mid}">
            <div class="payment-name" style="display:flex;align-items:center;gap:8px">
              <div class="member-avatar" style="background:${m.color};width:24px;height:24px;font-size:.65rem">${initials(m.name)}</div>
              ${m.name}
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:.85rem;color:var(--gray-600)">${fmtMoney(perPerson)}</span>
              <button class="payment-toggle ${paid ? 'paid' : 'owe'}" data-mid="${mid}">
                ${paid ? '✓ Đã trả' : '✕ Chưa trả'}
              </button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;

  detailBody.querySelectorAll('.payment-toggle').forEach(btn => {
    btn.addEventListener('click', () => togglePayment(sessionId, btn.dataset.mid));
  });

  document.getElementById('btnDeleteSession').onclick = () => deleteSession(sessionId);
  document.getElementById('btnEditSession').onclick = () => {
    closeModal('modalDetail');
    openSessionModal(sessionId);
  };

  openModal('modalDetail');
}

function togglePayment(sessionId, memberId) {
  const s = state.sessions.find(x => x.id === sessionId);
  if (!s) return;
  if (!s.paidStatus) s.paidStatus = {};
  s.paidStatus[memberId] = !s.paidStatus[memberId];
  save();
  renderSessions();
  renderMembers();
  // Re-open detail modal to refresh
  openDetailModal(sessionId);
}

function deleteSession(sessionId) {
  if (!confirm('Xóa buổi chơi này?')) return;
  state.sessions = state.sessions.filter(x => x.id !== sessionId);
  save();
  closeModal('modalDetail');
  renderSessions();
  renderMembers();
  showToast('Đã xóa buổi chơi', 'error');
}

// ---- Fund ----
let fundMode = 'add';
function openFundModal(mode) {
  fundMode = mode;
  document.getElementById('fundModalTitle').textContent = mode === 'add' ? '🏦 Nạp Quỹ' : '🏦 Rút Quỹ';
  document.getElementById('fundAmount2').value = '';
  document.getElementById('fundNote').value = '';
  openModal('modalFund');
}

document.getElementById('btnConfirmFund').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('fundAmount2').value) || 0;
  if (!amount) { showToast('Nhập số tiền', 'error'); return; }
  const note = document.getElementById('fundNote').value.trim();

  if (fundMode === 'add') {
    state.fund = (state.fund || 0) + amount;
    showToast(`Nạp quỹ ${fmtMoney(amount)} ✓`, 'success');
  } else {
    if (amount > (state.fund || 0)) { showToast('Quỹ không đủ!', 'error'); return; }
    state.fund = (state.fund || 0) - amount;
    showToast(`Rút quỹ ${fmtMoney(amount)} ✓`, 'success');
  }

  state.fundHistory = state.fundHistory || [];
  state.fundHistory.push({ type: fundMode, amount, note, date: new Date().toISOString() });
  save();
  document.getElementById('fundAmount').textContent = fmtMoney(state.fund);
  closeModal('modalFund');
});

// ---- Modal helpers ----
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ---- Wire up buttons ----
document.getElementById('btnAddSession').addEventListener('click', () => openSessionModal());
document.getElementById('btnManageMembers').addEventListener('click', () => {
  renderMembersManage();
  openModal('modalMembers');
});

document.getElementById('btnAddMember').addEventListener('click', addMember);
document.getElementById('newMemberName').addEventListener('keydown', e => {
  if (e.key === 'Enter') addMember();
});

function addMember() {
  const input = document.getElementById('newMemberName');
  const name = input.value.trim();
  if (!name) return;
  if (state.members.some(m => m.name.toLowerCase() === name.toLowerCase())) {
    showToast('Thành viên đã tồn tại', 'error'); return;
  }
  const color = COLORS[state.members.length % COLORS.length];
  state.members.push({ id: uid(), name, color });
  input.value = '';
  save();
  renderMembersManage();
  renderMembers();
  showToast(`Đã thêm ${name} ✓`, 'success');
}

document.getElementById('btnSaveSession').addEventListener('click', saveSession);

document.getElementById('btnSelectAll').addEventListener('click', () => {
  document.querySelectorAll('#attendeesCheck .member-check-item').forEach(el => el.classList.add('selected'));
  updateCostPreview();
});
document.getElementById('btnDeselectAll').addEventListener('click', () => {
  document.querySelectorAll('#attendeesCheck .member-check-item').forEach(el => el.classList.remove('selected'));
  updateCostPreview();
});

document.getElementById('courtFee').addEventListener('input', updateCostPreview);
document.getElementById('shuttleFee').addEventListener('input', updateCostPreview);

document.getElementById('filterMonth').addEventListener('change', () => {
  renderSessions();
});
document.getElementById('btnClearFilter').addEventListener('click', () => {
  document.getElementById('filterMonth').value = '';
  renderSessions();
});

document.getElementById('btnResetAll').addEventListener('click', () => {
  if (!confirm('Reset toàn bộ trạng thái thanh toán?')) return;
  state.sessions.forEach(s => s.paidStatus = {});
  save();
  renderSessions();
  renderMembers();
  showToast('Đã reset tất cả', 'success');
});

document.getElementById('btnAddFund').addEventListener('click', () => openFundModal('add'));
document.getElementById('btnWithdrawFund').addEventListener('click', () => openFundModal('withdraw'));

// ---- Init ----
function init() {
  load();
  renderSessions();
  renderMembers();
}

init();
