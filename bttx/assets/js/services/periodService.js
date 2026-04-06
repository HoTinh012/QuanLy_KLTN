/**
 * Period Management Service (Full Featured)
 * Restored from backup with ES Module exports
 */


function showAddPeriodModal() {
    const formHtml = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Tên Đợt (VD: Đợt 1 HK1 26-27)</label>
                <input type="text" id="period-name" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Loại đề tài</label>
                    <select id="period-type" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="KLTN">KLTN</option>
                        <option value="BCTT">BCTT</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Ngành áp dụng</label>
                    <select id="period-major" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="QLCN">QLCN</option>
                        <option value="ECom">ECom</option>
                        <option value="Log">Log</option>
                        <option value="IntBus">IntBus</option>
                    </select>
                </div>
            </div>
            <div class="flex items-center mt-2">
                <input type="checkbox" id="period-active" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" checked>
                <label for="period-active" class="ml-2 block text-sm text-gray-900">Kích hoạt tức thì (Active: Yes)</label>
            </div>
        </div>
    `;
    
    createModal('modal-add-period', 'Tạo Đợt Đăng Ký Mới', formHtml, () => {
        const name = document.getElementById('period-name').value;
        const type = document.getElementById('period-type').value;
        const major = document.getElementById('period-major').value;
        const active = document.getElementById('period-active').checked ? 'Yes' : 'No';
        
        if (name) {
            window.mockData.Dot.unshift({ StartReg: 46110, EndReg: 46119, Loaidetai: type, Major: major, Dot: name, Active: active });
            window.saveData();
        }
    });
}
