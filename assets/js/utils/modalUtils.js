/**
 * Utility functions for UI components like Modals and Toasts
 */

function createModal(id, title, formHtml, onSave, saveLabel = "Lưu dữ liệu", maxWidth = "max-w-lg") {
    let modal = document.getElementById(id);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = id;
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center hidden bg-slate-900/50 backdrop-blur-sm transition-opacity';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-xl w-full ${maxWidth} overflow-hidden transform transition-all mx-4">
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 class="text-lg font-bold text-slate-900">${title}</h3>
                <button type="button" class="text-slate-400 hover:text-rose-500 transition-colors" onclick="document.getElementById('${id}').classList.add('hidden')">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="p-6">
                <div class="custom-scrollbar overflow-y-auto max-h-[80vh]">
                    ${formHtml}
                </div>
                <div class="mt-6 flex justify-end gap-3 sticky bottom-0 bg-white pt-2 border-t border-slate-50">
                    <button type="button" class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50" onclick="document.getElementById('${id}').classList.add('hidden')">Hủy</button>
                    <button type="button" id="btn-save-${id}" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">${saveLabel}</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById(`btn-save-${id}`).onclick = () => {
        onSave();
        modal.classList.add('hidden');
    };
    
    modal.classList.remove('hidden');
}

function showToast(message) {
    let toast = document.getElementById('toast-noti');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-noti';
        toast.className = 'fixed bottom-8 right-8 z-[200] max-w-xs bg-indigo-900 text-white p-4 rounded-2xl shadow-2xl transform translate-y-20 opacity-0 transition-all duration-300 flex items-center gap-3 border border-indigo-500/30';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i data-lucide="bell-ring" class="w-5 h-5 text-indigo-400"></i> <div class="text-xs font-semibold">${message}</div>`;
    
    // Lucide icons need to be re-initialized if used in dynamic content
    if (window.lucide) window.lucide.createIcons();
    
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}
