/**
 * User Management Service (Full Featured)
 * Restored from backup with ES Module exports
 */


// 1. Add User Modal (Full version)
function showAddUserModal() {
    const formHtml = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Mã số (MSSV/MSGV)</label>
                    <input type="text" id="user-ms" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="21110xxx">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
                    <input type="text" id="user-ten" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Nguyễn Văn A">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" id="user-email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="nguyenvana@hcmute.edu.vn">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                    <select id="user-role" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="Student">Sinh viên</option>
                        <option value="Lecturer">Giảng viên</option>
                        <option value="TBM">Trưởng bộ môn</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Ngành</label>
                    <select id="user-major" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="QLCN">QLCN</option>
                        <option value="ECom">ECom</option>
                        <option value="Log">Log</option>
                        <option value="IntBus">IntBus</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Hệ đào tạo (Không bắt buộc)</label>
                <input type="text" id="user-hedaotao" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="CLC / Đại trà">
            </div>
        </div>
    `;
    
    createModal('modal-add-user', 'Thêm Người Dùng Mới', formHtml, () => {
        const ms = document.getElementById('user-ms').value;
        const ten = document.getElementById('user-ten').value;
        const email = document.getElementById('user-email').value;
        const role = document.getElementById('user-role').value;
        const major = document.getElementById('user-major').value;
        const hedaotao = document.getElementById('user-hedaotao').value;
        
        if (email && ten) {
            window.mockData.Data.unshift({ 
                MS: ms, 
                Ten: ten, 
                Email: email, 
                Role: role, 
                Major: major, 
                HeDaoTao: hedaotao 
            });
            window.saveData();
            showToast(`Đã thêm người dùng ${ten} thành công!`);
        } else {
            alert("Vui lòng nhập ít nhất Họ tên và Email!");
        }
    });
}

// 2. Edit User Modal
function showEditUserModal(email) {
    const user = window.mockData.Data.find(u => u.Email === email);
    if (!user) return;

    const formHtml = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Mã số</label>
                    <input type="text" id="edit-user-ms" value="${user.MS || ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
                    <input type="text" id="edit-user-ten" value="${user.Ten || ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email (Không thể sửa)</label>
                <input type="email" id="edit-user-email" disabled value="${user.Email}" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
                    <select id="edit-user-role" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="Student" ${user.Role === 'Student' ? 'selected' : ''}>Sinh viên</option>
                        <option value="Lecturer" ${user.Role === 'Lecturer' ? 'selected' : ''}>Giảng viên</option>
                        <option value="TBM" ${user.Role === 'TBM' ? 'selected' : ''}>Trưởng bộ môn</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Ngành</label>
                    <select id="edit-user-major" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="QLCN" ${user.Major === 'QLCN' ? 'selected' : ''}>QLCN</option>
                        <option value="ECom" ${user.Major === 'ECom' ? 'selected' : ''}>ECom</option>
                        <option value="Log" ${user.Major === 'Log' ? 'selected' : ''}>Log</option>
                        <option value="IntBus" ${user.Major === 'IntBus' ? 'selected' : ''}>IntBus</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Hệ đào tạo</label>
                <input type="text" id="edit-user-hedaotao" value="${user.HeDaoTao || ''}" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
        </div>
    `;
    
    createModal('modal-edit-user', 'Chỉnh Sửa Thông Tin Người Dùng', formHtml, () => {
        user.MS = document.getElementById('edit-user-ms').value;
        user.Ten = document.getElementById('edit-user-ten').value;
        user.Role = document.getElementById('edit-user-role').value;
        user.Major = document.getElementById('edit-user-major').value;
        user.HeDaoTao = document.getElementById('edit-user-hedaotao').value;
        window.saveData();
    });
}
