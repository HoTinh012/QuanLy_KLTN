/**
 * Main Application Logic (Full Featured - Firebase + ES Module)
 * Restored 100% from backup with async Firebase data loading
 */


// ============================================================
// EXPOSE ALL FUNCTIONS TO WINDOW (for legacy HTML onclick)
// ============================================================
window.showAddUserModal = showAddUserModal;
window.showEditUserModal = showEditUserModal;
window.showWorkflowModal = showWorkflowModal;
window.showDetailModal = showDetailModal;
window.showRegisterThesisModal = showRegisterThesisModal;
window.showEditQuotaModal = showEditQuotaModal;
window.showAddPeriodModal = showAddPeriodModal;
window.exportToCSV = exportToCSV;
window.batchApproveSelected = batchApproveSelected;
window.showToast = showToast;

window.toggleAllApprovals = function(checked) {
    document.querySelectorAll('.approval-checkbox').forEach(cb => cb.checked = checked);
};

window.resetData = function() {
    if (confirm("Hành động này sẽ XÓA TẤT CẢ các đề tài test và đưa hệ thống về trạng thái ban đầu. Bạn có chắc chắn không?")) {
        localStorage.removeItem('kltn_mockData');
        localStorage.removeItem('kltn_currentUser');
        window.location.reload();
    }
};

// ============================================================
// LOGIN / LOGOUT (uses mockData loaded from Firebase)
// ============================================================
window.login = function(email) {
    if (!email) return alert("Vui lòng nhập Email!");
    const user = window.mockData.Data.find(u => u.Email.toLowerCase() === email.toLowerCase());
    if (user) {
        window.currentUser = user;
        localStorage.setItem('kltn_currentUser', JSON.stringify(user));
        localStorage.setItem('kltn_last_email', email); // Remember for next time
        document.getElementById('login-overlay').classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => document.getElementById('login-overlay').classList.add('hidden'), 500);
        updateProfileUI();
        applyRBAC();
        renderData();
    } else {
        alert("Email không tồn tại trong hệ thống! (" + email + ")");
    }
};

/**
 * MOCK Google Login (For Local Simulation without 401: invalid_client)
 */
window.mockGoogleLogin = function() {
    const email = "hosytinh04@gmail.com";
    console.log("Mocking Google Login for:", email);
    
    // Fail-safe: Ensure user exists in memory
    if (window.mockData && window.mockData.Data) {
        let user = window.mockData.Data.find(u => u.Email.toLowerCase() === email.toLowerCase());
        if (!user) {
            console.log("Fail-safe: Manually injecting user into mockData...");
            user = {
                Email: email,
                MS: "Admin-01",
                Ten: "Hồ Sỹ Tình",
                Role: "Lecturer",
                Major: "Ktoan",
                HeDaoTao: ""
            };
            window.mockData.Data.unshift(user);
        }
    }
    
    // Simulate a brief delay to feel "real"
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) {
        const btn = event?.currentTarget;
        if (btn) {
            const originalContent = btn.innerHTML;
            btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Đang xác thực...`;
            if (window.lucide) window.lucide.createIcons();
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                if (window.lucide) window.lucide.createIcons();
                window.login(email);
            }, 800);
        } else {
            window.login(email);
        }
    }
};

/**
 * Handle Google Login Callback (Official GIS)
 */
window.handleGoogleLogin = function(response) {
    try {
        const payload = JSON.parse(atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const email = payload.email;
        console.log("Google Login Success:", email);
        window.login(email);
    } catch (e) {
        console.error("Google Login Error:", e);
        alert("Lỗi khi xử lý đăng nhập Google.");
    }
};

/**
 * Quick Account Picker for Offline/Local Use
 */
window.showQuickLogin = function() {
    const users = window.mockData.Data.slice(0, 10); // Show first 10 users as samples
    let listHtml = `<div class="space-y-2 max-h-60 overflow-y-auto mb-4">`;
    users.forEach(u => {
        listHtml += `
            <button onclick="window.login('${u.Email}'); document.getElementById('modal-quick-login').classList.add('hidden');" 
                class="w-full text-left p-3 hover:bg-blue-50 rounded-xl border border-slate-100 flex items-center gap-3 transition-all group">
                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                    ${u.Role[0]}
                </div>
                <div>
                    <p class="text-xs font-bold text-slate-700">${u.Ten}</p>
                    <p class="text-[9px] text-slate-400 italic">${u.Email}</p>
                </div>
            </button>
        `;
    });
    listHtml += `</div>`;
    listHtml += `<p class="text-[10px] text-slate-400 italic text-center">Mẹo: Khi chạy Offline (file://), Google không cho phép đăng nhập thật. Hãy chọn tài khoản mẫu ở trên.</p>`;
    
    if (typeof createModal === 'function') {
        createModal('modal-quick-login', 'CHỌN TÀI KHOẢN ĐĂNG NHẬP', listHtml, null, null, 'max-w-md');
    } else {
        alert("Vui lòng chọn tài khoản từ danh sách database.");
    }
};

window.logout = function() {
    window.currentUser = null;
    localStorage.removeItem('kltn_currentUser');
    location.reload();
};

// ============================================================
// SAVE DATA (sync localStorage + async Firebase)
// ============================================================
window.saveData = function() {
    if (typeof persistDataToStorage === 'function') {
        persistDataToStorage(window.mockData);
    } else {
        localStorage.setItem('kltn_mockData', JSON.stringify(window.mockData));
    }
    renderData();
};

// ============================================================
// UI FUNCTIONS
// ============================================================
// Helper: Lấy GVInfo theo Email
function getGVInfo(email) {
    return (window.mockData.GVInfo || []).find(g => g.EmailGV.toLowerCase() === email.toLowerCase());
}

function updateProfileUI() {
    if (!window.currentUser) return;
    
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarId = document.getElementById('sidebar-user-id');
    const sidebarRole = document.getElementById('sidebar-user-role');
    const sidebarAvatar = document.getElementById('sidebar-avatar');
    const headerName = document.getElementById('header-user-name');
    const headerId = document.getElementById('header-user-id');

    // ERD: Ten, MS
    const name = window.currentUser.Ten || window.currentUser.Email.split('@')[0];
    const roleStr = window.currentUser.Role === 'TBM' ? 'Trưởng bộ môn' : 
                   window.currentUser.Role === 'Lecturer' ? 'Giảng viên' : 'Sinh viên';
    const userId = window.currentUser.MS || '-';

    if (sidebarName) sidebarName.textContent = name;
    if (sidebarId) sidebarId.textContent = userId;
    if (sidebarRole) sidebarRole.textContent = roleStr;
    if (headerName) headerName.textContent = name;
    if (headerId) headerId.textContent = userId;

    if (sidebarAvatar) {
        sidebarAvatar.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${window.currentUser.Email}`;
        sidebarAvatar.classList.remove('hidden');
    }
}

function applyRBAC() {
    if (!window.currentUser) return;
    const role = window.currentUser.Role;
    
    const navs = {
        'users': document.getElementById('nav-users'),
        'periods': document.getElementById('nav-periods'),
        'quotas': document.getElementById('nav-quotas'),
        'documents': document.getElementById('nav-documents'),
        'approvals': document.getElementById('nav-approvals'),
        'adminHeader': document.getElementById('admin-menu-header')
    };

    // Reset visibility
    Object.values(navs).forEach(n => n?.classList.add('hidden'));

    if (role === 'Student') {
        // Students only see Dashboard, Theses
    } else if (role === 'Lecturer') {
        if (navs.approvals) navs.approvals.classList.remove('hidden');
    } else {
        // TBM sees everything
        Object.values(navs).forEach(n => {
            if (n) {
                n.classList.remove('hidden');
                n.classList.add('flex');
            }
        });
    }
    
    // Nút Đăng ký đề tài (SV)
    const registerBtn = document.getElementById('btn-show-register');
    if (registerBtn && window.currentUser.Role === 'Student') {
        const studentTheses = window.mockData.TenDetai.filter(t => t.EmailSV === window.currentUser.Email);
        
        let canRegister = false;
        if (studentTheses.length === 0) {
            canRegister = true;
        } else if (studentTheses.length === 1 && studentTheses[0].Role === 'BCTT' && studentTheses[0].Status === 'Hoàn tất BCTT') {
            canRegister = true;
        }

        if (canRegister) registerBtn.classList.remove('hidden');
        else registerBtn.classList.add('hidden');
    } else if (registerBtn) {
        registerBtn.classList.add('hidden');
    }
}

// ============================================================
// RENDER FUNCTIONS (Full from backup)
// ============================================================
function renderDashboard() {
    const stats = {
        totalSV: window.mockData.Data.filter(u => u.Role === 'Student').length,
        totalGV: window.mockData.Data.filter(u => u.Role === 'Lecturer' || u.Role === 'TBM').length,
        totalTheses: (window.mockData.TenDetai || []).length,
        needAction: (window.mockData.TenDetai || []).filter(t => ["Đăng ký BCTT", "Đăng ký KLTN", "GVHD Duyệt"].includes(t.Status)).length,
        missingCouncil: (window.mockData.TenDetai || []).filter(t => t.FlowType === 'KLTN' && t.Status === 'TBM Phân công PB').length
    };

    const elTotalSV = document.getElementById('dash-total-sv');
    if (elTotalSV) elTotalSV.textContent = stats.totalSV;
    const elSVInfo = document.getElementById('dash-student-thesis-info');
    if (elSVInfo) elSVInfo.textContent = `Tham gia ${stats.totalTheses} Đề tài`;

    const elTotalGV = document.getElementById('dash-total-gv');
    if (elTotalGV) elTotalGV.textContent = stats.totalGV;
    const totalMaxQuota = window.mockData.Quota.reduce((acc, q) => acc + q.Quota, 0);
    const elGVInfo = document.getElementById('dash-gv-quota-info');
    if (elGVInfo) elGVInfo.textContent = `Tổng Quota tối đa: ${totalMaxQuota}`;
    const elGVFill = document.getElementById('dash-gv-fill-rate');
    if (elGVFill) elGVFill.textContent = `Lấp đầy: ${totalMaxQuota > 0 ? Math.round((stats.totalTheses / totalMaxQuota) * 100) : 0}%`;

    const elNeedAction = document.getElementById('dash-need-action');
    if (elNeedAction) elNeedAction.textContent = stats.needAction + stats.missingCouncil;
    const elActionDetails = document.getElementById('dash-action-details');
    if (elActionDetails) elActionDetails.textContent = `${stats.needAction} chờ duyệt | ${stats.missingCouncil} thiếu HĐ/PB`;

    // Tiến độ theo Ngành
    const majorContainer = document.getElementById('dash-major-progress');
    if (majorContainer) {
        majorContainer.innerHTML = '';
        const majors = window.mockData.Major || ["QLCN", "ECom", "Logistics", "AI"];
        majors.forEach((m, idx) => {
            const count = (window.mockData.TenDetai || []).filter(t => t.Major === m).length;
            const target = 50;
            const percent = Math.min(100, Math.round((count / target) * 100));
            const colors = ["bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];
            
            const div = document.createElement('div');
            div.innerHTML = `
                <div class="flex justify-between text-sm mb-1.5">
                  <span class="font-semibold text-slate-700">${m}</span>
                  <span class="text-slate-500">${count} / ${target} Đề tài <span class="font-bold text-slate-800">(${percent}%)</span></span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div class="${colors[idx % colors.length]} h-2.5 rounded-full" style="width: ${percent}%"></div>
                </div>
            `;
            majorContainer.appendChild(div);
        });
    }

    // Bảng đề tài mới cập nhật
    const recentTable = document.getElementById('dash-recent-table');
    if (recentTable) {
        recentTable.innerHTML = '';
        const recentTheses = [...(window.mockData.TenDetai || [])].reverse().slice(0, 5);
        recentTheses.forEach(t => {
            const sv = window.mockData.Data.find(u => u.EmailSV === t.EmailSV);
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-50 hover:bg-slate-50 transition-colors group';
            tr.innerHTML = `
                <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">${(sv?.Ten || 'S')[0]}</div>
                        <div>
                            <p class="font-semibold text-slate-900">${sv?.Ten || t.EmailSV}</p>
                            <p class="text-xs text-slate-500">${t.EmailSV.split('@')[0]}</p>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6">
                    <div class="max-w-[250px]">
                        <p class="text-slate-900 font-medium truncate" title="${t.TenDeTai}">${t.TenDeTai}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold tracking-wider">${t.FlowType}</span>
                            <span class="text-xs text-slate-400">${t.Major || ''}</span>
                        </div>
                    </div>
                </td>
                <td class="py-4 px-6 text-slate-600 font-medium">${t.EmailGV ? t.EmailGV.split('@')[0] : 'Chưa có'}</td>
                <td class="py-4 px-6">
                    <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${["Hoàn thành", "Xác nhận cuối"].includes(t.Status) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}">
                        ${t.Status}
                    </span>
                </td>
                <td class="py-4 px-6 text-right">
                    <button class="p-2 text-slate-400 hover:text-indigo-600" onclick="window.showDetailModal('${t.EmailSV}', '${t.FlowType}')">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            recentTable.appendChild(tr);
        });
    }

    if (window.lucide) window.lucide.createIcons();
}

function renderUsers(query = '') {
    const tbody = document.querySelector('#users tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    // ERD: EmailSV, MS, Ten, Role, Major
    const filtered = window.mockData.Data.filter(u => `${u.EmailSV} ${u.Role} ${u.Major} ${u.Ten} ${u.MS}`.toLowerCase().includes(query.toLowerCase()));
    filtered.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-50 hover:bg-slate-50 transition-colors';
        const gvInfo = getGVInfo(user.EmailSV);
        const roleStr = user.Role === 'Student' ? `<span class="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Student</span>` : 
                        user.Role === 'Lecturer' ? `<span class="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Lecturer</span>` : 
                        `<span class="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">${user.Role || 'Other'}</span>`;
        const hocViStr = gvInfo ? (gvInfo.HocVi || []).join(', ') : '-';
        
        tr.innerHTML = `
            <td class="py-4 px-6">
                <p class="font-bold text-slate-900">${user.Ten || 'Chưa cập nhật'}</p>
                <p class="text-[10px] text-slate-500">${user.EmailSV || ''}</p>
            </td>
            <td class="py-4 px-6 text-slate-600 font-mono text-xs">${user.MS || '-'}</td>
            <td class="py-4 px-6">${roleStr}</td>
            <td class="py-4 px-6 text-slate-600 font-medium">${user.Major || ''}</td>
            <td class="py-4 px-6 text-slate-600 text-xs">${hocViStr}</td>
            <td class="py-4 px-6 text-right">
                <button class="p-1.5 text-slate-400 hover:text-indigo-600" onclick="window.showEditUserModal('${user.EmailSV}')"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPeriods(query = '') {
    const container = document.querySelector('#periods .grid');
    if (!container) return;
    container.innerHTML = '';
    const filtered = window.mockData.Dot.filter(d => `${d.Dot} ${d.Major} ${d.Loaidetai}`.toLowerCase().includes(query.toLowerCase()));
    filtered.forEach(dot => {
        const isActive = dot.Active === 'Yes';
        const cardStyle = isActive ? `bg-white rounded-2xl border-2 border-indigo-500 shadow-md p-6 relative overflow-hidden` : `bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-6 opacity-75`;
        const badge = isActive ? `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse"></span> Active</span>` : `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-500">Đã đóng</span>`;
        
        const div = document.createElement('div');
        div.className = cardStyle;
        div.innerHTML = `
            ${isActive ? '<div class="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full blur-2xl"></div>' : ''}
            <div class="flex justify-between items-start mb-4 relative z-10">
              ${badge}
              <button class="text-slate-400 hover:text-slate-600" onclick="window.showAddPeriodModal()"><i data-lucide="more-vertical" class="w-4 h-4"></i></button>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-1">${dot.Dot}</h3>
            <p class="text-sm text-slate-500 font-medium mb-4">Loại: ${dot.Loaidetai} • Ngành: ${dot.Major}</p>
        `;
        container.appendChild(div);
    });
}

function renderTheses(query = '') {
    const tbody1 = document.querySelector('#dashboard table tbody');
    const tbody2 = document.querySelector('#theses table tbody');
    
    let filtered = window.mockData.TenDetai || [];

    // RBAC Filter
    if (window.currentUser) {
        const userEmail = (window.currentUser.EmailSV || window.currentUser.Email || "").toLowerCase();
        if (window.currentUser.Role === 'Student') {
            filtered = filtered.filter(t => t.EmailSV && t.EmailSV.toLowerCase() === userEmail);
        } else if (window.currentUser.Role === 'Lecturer') {
            const mySVEmails = window.mockData.Trangthaidetai
                .filter(st => st.EmailGV && st.EmailGV.toLowerCase() === userEmail)
                .map(st => (st.EmailSV || "").toLowerCase());
            filtered = filtered.filter(t => t.EmailSV && mySVEmails.includes(t.EmailSV.toLowerCase()));
        }
    }

    if (query) {
        // ERD: TenDeTai, FlowType
        filtered = filtered.filter(t => `${t.EmailSV} ${t.TenDeTai} ${t.DotHK} ${t.FlowType}`.toLowerCase().includes(query.toLowerCase()));
    }

    [tbody2].forEach(tbody => {
        if(!tbody) return;
        tbody.innerHTML = '';
        filtered.forEach(topic => {
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-50 hover:bg-slate-50 transition-colors group';
            
            const escapedTitle = (topic.TenDeTai || "Untitled").replace(/'/g, "\\'");
            const hdList = window.mockData.Trangthaidetai.filter(t => 
                t.EmailSV && topic.EmailSV && 
                t.EmailSV.toLowerCase() === topic.EmailSV.toLowerCase() &&
                t.FlowType === topic.FlowType
            );
            const hdStr = hdList.map(h => `<span class="text-xs">[${h.Role || 'GV'}: ${h.EmailGV.split('@')[0]}]</span>`).join(' ');

            const statusLabel = topic.Status || "START";
            const statusColor = statusLabel.includes('DONE') ? 'bg-emerald-100 text-emerald-700' : 
                               statusLabel.includes('WAIT') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700';

            tr.innerHTML = `
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div>
                    <p class="font-semibold text-slate-900">${topic.EmailSV.split('@')[0]}</p>
                    <p class="text-xs text-slate-500">${topic.EmailSV}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="max-w-[250px] whitespace-normal">
                  <p class="text-slate-900 font-medium">${topic.TenDeTai}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-0.5 ${statusColor} rounded text-[10px] font-bold tracking-wider">${statusLabel}</span>
                    <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">${topic.FlowType}</span>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-slate-600 font-medium text-xs whitespace-normal w-48">${hdStr || 'Chưa phân công'}</td>
              <td class="py-4 px-6 text-right">
                <button class="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded text-xs font-semibold mr-2" onclick="window.showDetailModal('${topic.EmailSV}', '${topic.FlowType}')">Chi tiết</button>
                <button class="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold shadow-sm" onclick="window.showWorkflowModal('${topic.EmailSV}', '${escapedTitle}', '${topic.FlowType}', '${topic.Status}')">Thao tác Workflow</button>
              </td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function renderQuotas(query = '') {
    const tbody = document.querySelector('#quotas tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // ERD: EmailGV (thay Email cũ)
    const filtered = window.mockData.Quota.filter(q => `${q.EmailGV} ${q.Major}`.toLowerCase().includes(query.toLowerCase()));
    filtered.forEach(q => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-50 hover:bg-slate-50 transition-colors';
        tr.innerHTML = `
            <td class="py-4 px-6 font-medium text-slate-900">${q.EmailGV}</td>
            <td class="py-4 px-6 text-slate-600">${q.Major}</td>
            <td class="py-4 px-6">
               <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">${q.HeDaoTao}</span>
            </td>
            <td class="py-4 px-6">
               <span class="font-bold text-slate-700">${q.Quota}</span>
            </td>
            <td class="py-4 px-6"><button class="text-indigo-600 text-xs" onclick="window.showEditQuotaModal('${q.EmailGV}', '${q.Major}', ${q.Quota})">Sửa</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDocuments(query = '') {
    const tbody = document.querySelector('#documents tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const filtered = (window.mockData.Hoso || []).filter(h => h.EmailSV.toLowerCase().includes(query.toLowerCase()));

    filtered.forEach(h => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-50 hover:bg-slate-50 transition-colors';
        
        tr.innerHTML = `
            <td class="py-4 px-6">
                <p class="font-semibold text-slate-900">${h.EmailSV}</p>
                <div class="mt-1 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg italic border border-slate-100">
                    <b>Tóm tắt:</b> ${h.Summary || 'Chưa cập nhật...'}
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex flex-col gap-1.5 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100/50">
                    ${window.currentUser?.Role !== 'Student' ? `
                    <div class="flex justify-between text-[10px] font-bold"><span class="text-slate-400">GVHD:</span> <span class="text-indigo-600">${h.Score_HD || '-'}</span></div>
                    <div class="flex justify-between text-[10px] font-bold"><span class="text-slate-400">GVPB:</span> <span class="text-indigo-600">${h.Score_PB || '-'}</span></div>
                    <div class="flex justify-between text-[10px] font-bold"><span class="text-slate-400">HỘI ĐỒNG:</span> <span class="text-rose-600">${h.Score_Council || '-'}</span></div>
                    <div class="h-px bg-slate-200/50 my-1"></div>
                    ` : `
                    <div class="text-[10px] text-slate-400 italic text-center py-1">Điểm thành phần chỉ hiển thị cho GV</div>
                    <div class="h-px bg-slate-200/50 my-1"></div>
                    `}
                    <div class="flex justify-between text-xs font-extrabold"><span class="text-slate-900">TỔNG:</span> <span class="text-emerald-700">${h.Score || '-'}</span></div>
                </div>
            </td>
            <td class="py-4 px-6">
                <div class="flex flex-col gap-2">
                    <div class="flex flex-wrap gap-1">
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${h.Confirm_HD ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}">GVHD Duyệt sửa</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${h.Confirm_Chair ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-400'}">CT Duyệt sửa</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="text-[10px] text-orange-600 font-bold mb-1">Turnitin: ${h.Turnitin_Rate || '0'}%</div>
                        <a href="#" class="text-xs text-indigo-600 hover:underline flex items-center"><i data-lucide="file" class="w-3 h-3 mr-1"></i> ${h.BienBan || 'Chưa nộp BB'}</a>
                        <a href="#" class="text-xs text-emerald-600 hover:underline flex items-center"><i data-lucide="check-square" class="w-3 h-3 mr-1"></i> ${h.ChinhSua || 'Minh chứng bản sửa'}</a>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderApprovals() {
    const tbody = document.querySelector('#approvals tbody');
    if (!tbody || !window.currentUser) return;
    tbody.innerHTML = '';

    const role = window.currentUser.Role;
    const email = window.currentUser.Email.toLowerCase();

    const lecturerSteps = ["Đăng ký BCTT", "Thực hiện báo cáo TT", "Đăng ký KLTN", "TBM Phân công PB", "Hoàn tất KLTN", "Nhập điểm & BB HĐ", "Upload bài chỉnh sửa"];
    const tbmSteps = ["GVHD Duyệt", "TBM Phân công PB", "Upload Turnitin", "TBM Phân công Hội đồng"];

    const pending = window.mockData.TenDetai.filter(t => {
        const studentEmail = t.EmailSV || t.Email;
        if (!studentEmail) return false;

        if (role === 'Lecturer') {
            const isAssigned = window.mockData.Trangthaidetai.some(st => 
                (st.EmailSV || st.Email) && 
                (st.EmailSV || st.Email).toLowerCase() === studentEmail.toLowerCase() && 
                st.EmailGV && email &&
                st.EmailGV.toLowerCase() === email &&
                (st.Loai === t.Role || st.FlowType === t.Role || !st.Loai)
            );
            return lecturerSteps.includes(t.Status) && isAssigned;
        } else if (role === 'TBM') {
            return tbmSteps.includes(t.Status) || lecturerSteps.includes(t.Status);
        }
        return false;
    });

    const badge = document.getElementById('badge-approvals');
    if (badge) {
        if (pending.length > 0) {
            badge.textContent = pending.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    pending.forEach(t => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-50 hover:bg-slate-50 transition-colors';
        const displayEmail = t.EmailSV || t.Email || "Unknown";
        const displayTitle = t.TenDeTai || t.Tendetai || "Untitled";
        const escapedTitle = displayTitle.replace(/'/g, "\\'");
        tr.innerHTML = `
            <td class="py-4 px-6">
                <input type="checkbox" class="approval-checkbox rounded border-slate-300" data-email="${displayEmail}" data-flow="${t.Role}">
            </td>
            <td class="py-4 px-6 font-semibold text-slate-900">${displayEmail}</td>
            <td class="py-4 px-6 text-sm text-slate-600">${displayTitle}</td>
            <td class="py-4 px-6">
                <span class="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[10px] font-bold uppercase">${t.Status}</span>
            </td>
            <td class="py-4 px-6 text-right">
                <button class="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold shadow-sm" onclick="window.showWorkflowModal('${displayEmail}', '${escapedTitle}', '${t.Role}', '${t.Status}')">Xử lý Phê duyệt</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
// MAIN RENDER
// ============================================================
function renderData(query = '') {
    renderDashboard();
    renderUsers(query);
    renderPeriods(query);
    renderTheses(query);
    renderQuotas(query);
    renderDocuments(query);
    renderApprovals();
    if (window.lucide) window.lucide.createIcons();
}

window.renderData = renderData;

// ============================================================
// APP INITIALIZATION (Async — loads from Firebase first)
// ============================================================
async function initApp() {
    console.log("🚀 UniThesis initializing...");
    
    // 1. Load data from Firebase (async)
    window.mockData = await loadData();
    
    // 2. Restore session
    window.currentUser = JSON.parse(localStorage.getItem('kltn_currentUser')) || null;
    
    // 3. Icons
    if (window.lucide) window.lucide.createIcons();
    
    // 4. Check session
    if (window.currentUser) {
        document.getElementById('login-overlay').classList.add('hidden');
        updateProfileUI();
        applyRBAC();
    }
    
    // 5. Login Events
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.onclick = () => {
            const email = document.getElementById('login-email').value;
            window.login(email);
        };
    }

    // Auto-fill last email
    const lastEmail = localStorage.getItem('kltn_last_email');
    if (lastEmail && document.getElementById('login-email')) {
        document.getElementById('login-email').value = lastEmail;
    }

    // Google Button Behavior for Offline vs Online
    const isLocal = window.location.protocol === 'file:';
    const gContainer = document.querySelector('.g_id_signin');
    if (isLocal && gContainer) {
        gContainer.innerHTML = `
            <button onclick="window.showQuickLogin()" 
              class="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-sm shadow-xl shadow-slate-200/50 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" class="w-5 h-5" alt="G">
              CHỌN TÀI KHOẢN GOOGLE (OFFLINE)
            </button>
        `;
    }
    
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.onclick = () => window.logout();
    
    // 6. Tab Switching (Full HCMUTE Style)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('bg-white/20', 'text-white', 'font-black', 'active');
                b.classList.add('text-white/70', 'hover:bg-white/10', 'hover:text-white');
                const indicator = b.querySelector('.active-indicator');
                if (indicator) indicator.classList.add('hidden');
                
                const icon = b.querySelector('.icon');
                if(icon) {
                    icon.classList.remove('text-white');
                    icon.classList.add('text-blue-200');
                }
            });

            tabContents.forEach(content => content.classList.remove('active'));

            btn.classList.add('bg-white/20', 'text-white', 'font-black', 'active');
            btn.classList.remove('text-white/70', 'hover:bg-white/10', 'hover:text-white');
            const activeIndicator = btn.querySelector('.active-indicator');
            if (activeIndicator) activeIndicator.classList.remove('hidden');

            const activeIcon = btn.querySelector('.icon');
            if(activeIcon) {
                activeIcon.classList.add('text-white');
                activeIcon.classList.remove('text-blue-200');
            }

            const targetId = btn.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
            
            renderData();
        });
    });

    // 7. Default tab
    if (window.currentUser) {
        const dashboardBtn = document.getElementById('nav-dashboard');
        if (dashboardBtn) dashboardBtn.click();
    }

    // 8. Global search
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderData(e.target.value);
        });
    }

    // 9. Initial render
    renderData();
    
    console.log("✅ UniThesis ready! Data loaded from Firebase.");
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);
