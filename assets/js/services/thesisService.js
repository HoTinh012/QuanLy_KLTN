/**
 * Thesis & Workflow Service (Full Featured)
 * Complete BCTT/KLTN 14-step workflow, details, registration, quota, export
 * Restored 100% from backup with ES Module exports
 */


// ============================================================
// 1. WORKFLOW MODAL (Full 14-step BCTT/KLTN workflow)
// ============================================================
function showWorkflowModal(emailSV, tenDeTai, flowType, currentStatus) {
    if (!emailSV) return alert("Lỗi: Không xác định được Email Sinh viên.");
    
    const role = window.currentUser.Role;
    const isOwner = (window.currentUser.EmailSV || window.currentUser.Email || "").toLowerCase() === emailSV.toLowerCase();
    
    const topic = window.mockData.TenDetai.find(t => 
        t.EmailSV && emailSV &&
        t.EmailSV.toLowerCase() === emailSV.toLowerCase() && 
        t.FlowType === flowType
    );
    const assignments = window.mockData.Trangthaidetai.filter(a => 
        a.EmailSV && emailSV &&
        a.EmailSV.toLowerCase() === emailSV.toLowerCase() && 
        a.FlowType === flowType
    );
    const isAssigned = assignments.some(a => 
        a.EmailGV && (window.currentUser.EmailSV || window.currentUser.Email) &&
        a.EmailGV.toLowerCase() === (window.currentUser.EmailSV || window.currentUser.Email).toLowerCase()
    );
    
    if (!topic) {
        console.warn("Workflow Error: Topic not found for", emailSV, flowType);
    }

    let nextStepContent = "";
    let canAction = false;
    let nextStatus = "";
    let actionLabel = "Xác nhận thực hiện";
    let isDecisionStep = false;

    const isLecturerAllowed = (role === 'Lecturer' && isAssigned);
    const isTBMAllowed = (role === 'TBM');
    const isStudentAllowed = (role === 'Student' && isOwner);

    // LUỒNG BCTT
    if (flowType === "BCTT") {
        switch (currentStatus) {
            case "Đăng ký BCTT":
                isDecisionStep = true;
                nextStepContent = `
                    <p class="text-sm mb-3"><b>Bước tiếp theo:</b> GV xác nhận đề tài (Có quyền yêu cầu chỉnh sửa tên).</p>
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Tên đề tài (GV có thể sửa)</label>
                        <input type="text" id="wf-rename" class="w-full px-3 py-2 border rounded-xl text-sm" value="${tenDeTai}">
                    </div>
                `;
                if (isLecturerAllowed || isTBMAllowed) canAction = true;
                nextStatus = "Xác nhận đề tài";
                break;
            case "Xác nhận đề tài":
                nextStepContent = `<p class="text-sm"><b>Bước tiếp theo:</b> Thực hiện báo cáo TT. SV cần upload Báo cáo & Giấy xác nhận.</p>`;
                if (isStudentAllowed) canAction = true;
                nextStatus = "Thực hiện báo cáo TT";
                actionLabel = "SV: Upload Báo cáo/Giấy XN";
                break;
            case "Thực hiện báo cáo TT":
                isDecisionStep = true;
                nextStepContent = `<p class="text-sm"><b>Bước tiếp theo:</b> Hoàn tất BCTT. GV duyệt kết quả cuối cùng.</p>`;
                if (isLecturerAllowed || isTBMAllowed) canAction = true;
                nextStatus = "Hoàn tất BCTT";
                break;
            case "Hoàn tất BCTT":
                nextStepContent = `
                    <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                        <i data-lucide="check-circle" class="w-8 h-8 text-emerald-500 mx-auto mb-2"></i>
                        <p class="text-emerald-700 font-bold">Xác nhận Hoàn tất thực tập!</p>
                        <p class="text-[10px] text-emerald-600 mt-1 italic">SV đã có thể Đăng ký KLTN.</p>
                    </div>
                `;
                break;
        }
    } 
    // LUỒNG KLTN
    else {
        switch (currentStatus) {
            case "Đăng ký KLTN":
                isDecisionStep = true;
                nextStepContent = `<p class="text-sm"><b>GVHD Duyệt:</b> Giảng viên hướng dẫn xem xét đề tài KLTN.</p>`;
                if (isLecturerAllowed || isTBMAllowed) canAction = true;
                nextStatus = "GVHD Duyệt";
                break;
            case "GVHD Duyệt":
                isDecisionStep = true;
                nextStepContent = `
                    <p class="text-sm mb-3"><b>TBM Quyết định:</b> Thay đổi Người hướng dẫn / phản biện (nếu có).</p>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Giảng viên hướng dẫn</label>
                            <input type="text" id="wf-new-gvhd" class="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Nhập Email GVHD mới (nếu muốn đổi)">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">Phân công Phản biện</label>
                            <input type="text" id="wf-new-gvpb" class="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Nhập Email GVPB">
                        </div>
                    </div>
                `;
                if (isTBMAllowed) canAction = true;
                nextStatus = "TBM Phân công PB";
                break;
            case "TBM Phân công PB":
                isDecisionStep = true;
                nextStepContent = `<p class="text-sm"><b>GV Phản biện xác nhận:</b> Đồng ý/Từ chối phản biện đề tài này.</p>`;
                if (isLecturerAllowed || isTBMAllowed) canAction = true;
                nextStatus = "Thực hiện đề tài";
                break;
            case "Thực hiện đề tài":
                nextStepContent = `
                    <p class="text-sm mb-3"><b>Bước tiếp theo:</b> SV nộp file bài làm KLTN và tóm tắt nội dung. Sau khi SV nộp, GV sẽ thực hiện kiểm tra Turnitin.</p>
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-500">TÓM TẮT NỘI DUNG ĐỀ TÀI</label>
                        <textarea id="wf-summary" class="w-full px-3 py-2 border rounded-xl text-sm min-h-[100px]" placeholder="Nhập tóm tắt ngắn gọn nội dung đề tài..."></textarea>
                    </div>
                `;
                if (isStudentAllowed) canAction = true;
                nextStatus = "Hoàn tất KLTN";
                actionLabel = "SV: Upload file bài làm & Tóm tắt";
                break;
            case "Hoàn tất KLTN":
                isDecisionStep = true;
                nextStepContent = `
                    <p class="text-sm mb-3"><b>GV Upload Turnitin:</b> SV đã nộp bài. Giảng viên kiểm tra đạo văn và upload kết quả Turnitin.</p>
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-slate-500">TỶ LỆ TURNITIN (%) — GV nhập sau khi kiểm tra</label>
                        <input type="number" id="wf-turnitin" class="w-full px-3 py-2 border rounded-xl text-sm" placeholder="VD: 15">
                    </div>
                    <p class="text-[10px] text-rose-500 mt-2 italic">* Nếu chọn TỪ CHỐI, đề tài sẽ Kết thúc (End - Học lại).</p>
                `;
                if (isLecturerAllowed || isTBMAllowed) canAction = true;
                nextStatus = "Upload Turnitin";
                break;
            case "Upload Turnitin":
                isDecisionStep = true;
                nextStepContent = `
                    <p class="text-sm mb-3"><b>TBM Quyết định:</b> Phân công thành viên Hội đồng & Lịch bảo vệ.</p>
                    <div class="grid grid-cols-1 gap-3">
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" id="wf-hd-chairman" class="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Email Chủ tịch HĐ">
                            <input type="text" id="wf-hd-secretary" class="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Email Thư ký">
                        </div>
                        <input type="text" id="wf-hd-member" class="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Email Ủy viên">
                        
                        <div class="p-3 bg-slate-50 rounded-xl border border-dotted border-slate-300 space-y-2 mt-2">
                            <label class="block text-[10px] font-bold text-slate-500 uppercase">Thông tin lịch bảo vệ</label>
                            <input type="date" id="wf-hd-date" class="w-full px-3 py-2 border rounded-xl text-sm">
                            <div class="grid grid-cols-2 gap-2">
                                <input type="time" id="wf-hd-time" class="w-full px-3 py-2 border rounded-xl text-sm">
                                <input type="text" id="wf-hd-loc" class="w-full px-3 py-2 border rounded-xl text-sm" placeholder="Phòng/Địa điểm">
                            </div>
                        </div>
                    </div>
                `;
                if (isTBMAllowed) canAction = true;
                nextStatus = "TBM Phân công Hội đồng";
                break;
            case "TBM Phân công Hội đồng":
                const hosoSec = (window.mockData.Hoso || []).find(h => h.EmailSV.toLowerCase() === emailSV.toLowerCase());
                const svDataForScore = window.mockData.Data.find(u => u.Email.toLowerCase() === emailSV.toLowerCase());
                nextStepContent = `
                    <p class="text-sm mb-3 font-bold text-center text-slate-800 uppercase tracking-wide">BẢNG NHẬP ĐIỂM & NỘI DUNG HỘI ĐỒNG</p>
                    <div class="overflow-x-auto -mx-4 -mb-4 custom-scrollbar">
                        <table class="w-full text-[11px] border-collapse min-w-[1000px]" id="score-table">
                            <thead>
                                <tr class="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 rounded-tl-lg w-10">STT</th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-24">MSSV</th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500">Họ tên sinh viên</th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-16">GVHD<br><span class="text-[9px] font-normal opacity-80">(4)</span></th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-16">GVPB<br><span class="text-[9px] font-normal opacity-80">(5)</span></th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-16">CTHĐ<br><span class="text-[9px] font-normal opacity-80">(6)</span></th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-16">TVHĐ1<br><span class="text-[9px] font-normal opacity-80">(7)</span></th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-16">TVHĐ2<br><span class="text-[9px] font-normal opacity-80">(8)</span></th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-16">TVHĐ3<br><span class="text-[9px] font-normal opacity-80">(9)</span></th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-16">TVHĐ4<br><span class="text-[9px] font-normal opacity-80">(10)</span></th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 w-20 bg-blue-800">ĐIỂM TB<br><span class="text-[9px] font-normal opacity-80">(11)</span></th>
                                    <th class="py-3 px-2 text-center font-bold border border-blue-500 rounded-tr-lg w-20">BB HĐ</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="bg-white hover:bg-blue-50 transition-colors">
                                    <td class="py-3 px-2 text-center border border-slate-200 font-medium text-slate-500">1</td>
                                    <td class="py-3 px-2 text-center border border-slate-200 font-mono text-slate-800 font-bold">${svDataForScore?.MS || '-'}</td>
                                    <td class="py-3 px-2 border border-slate-200 font-bold text-slate-900 whitespace-nowrap">${svDataForScore?.Ten || emailSV.split('@')[0]}</td>
                                    <td class="py-1 px-1 border border-slate-200"><input type="number" id="wf-score-hd" value="${hosoSec?.Score_GVHD || ''}" step="0.1" min="0" max="10" class="w-full px-1 py-2 border border-slate-100 rounded text-center text-[13px] font-bold focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" oninput="window._calcAvg()"></td>
                                    <td class="py-1 px-1 border border-slate-200"><input type="number" id="wf-score-pb" value="${hosoSec?.Score_GVPB || ''}" step="0.1" min="0" max="10" class="w-full px-1 py-2 border border-slate-100 rounded text-center text-[13px] font-bold focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" oninput="window._calcAvg()"></td>
                                    <td class="py-1 px-1 border border-slate-200"><input type="number" id="wf-score-cthd" value="${hosoSec?.Score_CTHD || ''}" step="0.1" min="0" max="10" class="w-full px-1 py-2 border border-slate-100 rounded text-center text-[13px] font-bold focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" oninput="window._calcAvg()"></td>
                                    <td class="py-1 px-1 border border-slate-200"><input type="number" id="wf-score-tv1" value="${hosoSec?.Score_TVHD1 || ''}" step="0.1" min="0" max="10" class="w-full px-1 py-2 border border-slate-100 rounded text-center text-[13px] font-bold focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" oninput="window._calcAvg()"></td>
                                    <td class="py-1 px-1 border border-slate-200"><input type="number" id="wf-score-tv2" value="${hosoSec?.Score_TVHD2 || ''}" step="0.1" min="0" max="10" class="w-full px-1 py-2 border border-slate-100 rounded text-center text-[13px] font-bold focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" oninput="window._calcAvg()"></td>
                                    <td class="py-1 px-1 border border-slate-200"><input type="number" id="wf-score-tv3" value="${hosoSec?.Score_TVHD3 || ''}" step="0.1" min="0" max="10" class="w-full px-1 py-2 border border-slate-100 rounded text-center text-[13px] font-bold focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" oninput="window._calcAvg()"></td>
                                    <td class="py-1 px-1 border border-slate-200"><input type="number" id="wf-score-tv4" value="${hosoSec?.Score_TVHD4 || ''}" step="0.1" min="0" max="10" class="w-full px-1 py-2 border border-slate-100 rounded text-center text-[13px] font-bold focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none" oninput="window._calcAvg()"></td>
                                    <td class="py-3 px-2 text-center border border-slate-200 bg-blue-50">
                                        <span id="wf-score-avg" class="text-lg font-black text-blue-700">${hosoSec?.Score || '0'}</span>
                                    </td>
                                    <td class="py-3 px-1 text-center border border-slate-200">
                                        <button type="button" class="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-sm" onclick="window.showBienBanModal('${emailSV}', '${flowType}')">BIÊN BẢN</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-3">
                        <label class="block text-[10px] font-bold text-slate-500 mb-1">FILE BIÊN BẢN HỘI ĐỒNG</label>
                        <input type="text" id="wf-bienban" class="w-full px-3 py-2 border rounded-xl text-sm" value="${hosoSec?.BienBan || `BB_HoiDong_${emailSV.split('@')[0]}.pdf`}">
                    </div>
                `;
                if (isLecturerAllowed || isTBMAllowed) canAction = true;
                nextStatus = "Nhập điểm & BB HĐ";
                actionLabel = "Xác nhận & Lưu điểm";
                break;
            case "Nhập điểm & BB HĐ":
                nextStepContent = `<p class="text-sm"><b>SV Tiếp thu:</b> Upload bài chỉnh sửa sau hội đồng (Lưu trữ Minh chứng).</p>`;
                if (isStudentAllowed) canAction = true;
                nextStatus = "Upload bài chỉnh sửa";
                actionLabel = "SV: Nộp bản sửa cuối";
                break;
            case "Upload bài chỉnh sửa":
                isDecisionStep = true;
                const hosoCurrent = (window.mockData.Hoso || []).find(h => h.EmailSV.toLowerCase() === emailSV.toLowerCase());
                const isHDConfirmed = hosoCurrent?.Confirm_HD === true;
                
                nextStepContent = `
                    <p class="text-sm mb-3"><b>Xác nhận cuối:</b> GVHD và Chủ tịch HĐ đồng kiểm tra bản sửa.</p>
                    <div class="flex flex-col gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                        <label class="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                            <input type="checkbox" id="wf-confirm-hd" ${isHDConfirmed ? 'checked' : ''} ${role === 'Lecturer' ? '' : 'disabled'} class="rounded-lg border-indigo-300 w-5 h-5 text-indigo-600 focus:ring-indigo-500">
                            <div class="flex-1">
                                <span class="text-xs font-bold text-slate-700 block">GV Hướng dẫn xác nhận</span>
                                <span class="text-[10px] text-slate-400">${isHDConfirmed ? 'Đã xác nhận bài sửa' : 'Đang chờ GVHD kiểm tra...'}</span>
                            </div>
                        </label>
                        
                        <label class="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 ${!isHDConfirmed ? 'opacity-50 grayscale' : ''}">
                            <input type="checkbox" id="wf-confirm-chair" ${!isHDConfirmed ? 'disabled' : ''} class="rounded-lg border-indigo-300 w-5 h-5 text-indigo-600 focus:ring-indigo-500">
                            <div class="flex-1">
                                <span class="text-xs font-bold text-slate-700 block">Chủ tịch HĐ xác nhận</span>
                                <span class="text-[10px] text-slate-400">${isHDConfirmed ? 'GVHD đã duyệt. Chủ tịch có thể chốt.' : 'Cần GVHD duyệt trước.'}</span>
                            </div>
                        </label>
                    </div>
                `;
                if (isLecturerAllowed || isTBMAllowed) canAction = true;
                nextStatus = "Xác nhận cuối";
                break;
            case "Xác nhận cuối":
                nextStepContent = `
                    <div class="p-6 bg-emerald-900 text-white rounded-2xl text-center space-y-3">
                        <i data-lucide="award" class="w-12 h-12 text-yellow-400 mx-auto animate-bounce"></i>
                        <h4 class="text-lg font-extrabold uppercase">Hoàn tất Quy trình</h4>
                        <p class="text-xs text-emerald-100 italic">Sinh viên đã hoàn thành khóa luận tốt nghiệp!</p>
                    </div>
                `;
                break;
        }
    }

    const decisionHtml = isDecisionStep ? `
        <div class="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl mt-4">
            <label class="flex items-center gap-2 cursor-pointer flex-1 justify-center p-2 bg-white rounded-lg border hover:border-emerald-500 transition-all">
                <input type="radio" name="wf-decision" value="approve" checked class="w-4 h-4 text-emerald-500">
                <span class="text-xs font-bold text-emerald-700">DUYỆT</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer flex-1 justify-center p-2 bg-white rounded-lg border hover:border-rose-500 transition-all">
                <input type="radio" name="wf-decision" value="reject" class="w-4 h-4 text-rose-500">
                <span class="text-xs font-bold text-rose-700">TỪ CHỐI</span>
            </label>
        </div>
    ` : "";

    const topicEntry = window.mockData.TenDetai.find(t => t.EmailSV.toLowerCase() === emailSV.toLowerCase() && t.Role === flowType);
    let emailGV_Topic = topicEntry?.EmailGV;
    if (!emailGV_Topic) {
        const ass = window.mockData.Trangthaidetai.find(a => a.EmailSV.toLowerCase() === emailSV.toLowerCase() && a.Loai === flowType && a.Role === 'HD');
        emailGV_Topic = ass?.EmailGV;
    }
    const svUser = window.mockData.Data.find(u => u.Email.toLowerCase() === emailSV.toLowerCase());
    const gvInfo = (window.mockData.GVInfo || []).find(g => g.EmailGV.toLowerCase() === (emailGV_Topic || '').toLowerCase());

    const summaryCardHtml = `
        <div class="p-4 rounded-2xl border ${flowType === 'BCTT' ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'} mb-4">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <p class="text-[10px] font-bold ${flowType === 'BCTT' ? 'text-emerald-500' : 'text-indigo-500'} uppercase tracking-widest mb-1">Thông tin xét duyệt ${flowType}</p>
                    <h4 class="text-sm font-extrabold text-slate-800 leading-tight">${topicEntry?.TenDeTai || 'Chưa có tên đề tài'}</h4>
                </div>
                <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${flowType === 'BCTT' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}">${flowType}</span>
            </div>
            <div class="grid grid-cols-2 gap-y-3 gap-x-4 text-[11px]">
                <div>
                    <p class="text-slate-400 font-medium mb-0.5">Sinh viên</p>
                    <p class="text-slate-900 font-bold">${svUser?.Ten || emailSV}</p>
                    <p class="text-[9px] text-slate-500 font-mono">${svUser?.MS || '-'}</p>
                </div>
                <div>
                    <p class="text-slate-400 font-medium mb-0.5">GV Hướng dẫn chính</p>
                    <p class="text-slate-900 font-bold">${gvInfo ? `${(gvInfo.HocVi||[]).join(' ')} ${gvInfo.Name}` : '-'}</p>
                    <p class="text-[9px] text-slate-500 font-mono">${gvInfo?.MSGV || '-'}</p>
                </div>
                <div>
                    <p class="text-slate-400 font-medium mb-0.5">Lĩnh vực/Mảng</p>
                    <p class="text-slate-700 font-bold">${topicEntry?.MangDetai || '-'}</p>
                </div>
                <div>
                    <p class="text-slate-400 font-medium mb-0.5">Đợt - Năm học</p>
                    <p class="text-slate-700 font-bold">${topicEntry?.DotHK || '-'} (${topicEntry?.NH || '-'})</p>
                </div>
                ${flowType === 'BCTT' ? `
                <div class="col-span-2 pt-2 border-t border-emerald-100/50">
                    <p class="text-slate-400 font-medium">Công ty thực tập</p>
                    <p class="text-emerald-800 font-bold">${topicEntry?.TenCongTy || '-'}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    const formHtml = `
        <div class="space-y-4">
            ${summaryCardHtml}

            <div class="p-4 bg-slate-900 text-white border border-slate-700 rounded-2xl">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TRẠNG THÁI HIỆN TẠI</p>
                <div class="flex items-center justify-between">
                    <p class="text-white font-extrabold text-lg">${currentStatus}</p>
                    <span class="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">Step Action</span>
                </div>
            </div>
            
            <div class="py-2 text-slate-600">
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quyền thực hiện:</span>
                        ${isLecturerAllowed ? '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold border border-emerald-200">GIẢNG VIÊN</span>' : ''}
                        ${isTBMAllowed ? '<span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold border border-purple-200">TRƯỞNG BỘ MÔN</span>' : ''}
                        ${isStudentAllowed ? '<span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold border border-blue-200">SINH VIÊN</span>' : ''}
                    </div>
                    <div class="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <i data-lucide="info" class="w-4 h-4 text-blue-500 shrink-0 mt-0.5"></i>
                        <div class="text-xs text-blue-700 leading-relaxed">${nextStepContent}</div>
                    </div>
                </div>
            </div>

            ${decisionHtml}

            ${!canAction && nextStatus ? `
                <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 items-center">
                    <i data-lucide="shield-alert" class="text-rose-500 w-5 h-5 shrink-0"></i>
                    <p class="text-xs text-rose-600 font-medium italic">Bạn chưa đúng Vai trò hoặc quyền hạn để thực hiện bước này.</p>
                </div>
            ` : ""}
        </div>
    `;
    
    createModal('modal-workflow', flowType + ': Xử lý tiến độ', formHtml, () => {
        if (!canAction) return;

        const decision = isDecisionStep ? document.querySelector('input[name="wf-decision"]:checked').value : 'approve';
        
        if (topic) {
            if (decision === 'reject') {
                if (currentStatus === "Hoàn tất KLTN") {
                    topic.Status = "KẾT THÚC (TRƯỢT)";
                    showToast("Thông báo: Đề tài đã bị dừng (KẾT THÚC) do không đạt yêu cầu.");
                } else {
                    topic.Status = (flowType === "BCTT") ? "Đăng ký BCTT" : "Đăng ký KLTN";
                    showToast("Thông báo: Đề tài đã bị từ chối và quay lại bước Đăng ký.");
                }
            } else {
                if (!window.mockData.Hoso) window.mockData.Hoso = [];
                let hoso = window.mockData.Hoso.find(h => 
                    h.EmailSV && emailSV && 
                    h.EmailSV.toLowerCase() === emailSV.toLowerCase()
                );
                if (!hoso) {
                    hoso = { EmailSV: emailSV, EmailGV: window.currentUser.Email };
                    window.mockData.Hoso.push(hoso);
                }

                if (document.getElementById('wf-summary')) hoso.Summary = document.getElementById('wf-summary').value;
                if (document.getElementById('wf-turnitin')) hoso.Turnitin_Rate = document.getElementById('wf-turnitin').value;
                
                if (nextStatus === "TBM Phân công PB") {
                    const newGvhd = document.getElementById('wf-new-gvhd') ? document.getElementById('wf-new-gvhd').value : "";
                    const newGvpb = document.getElementById('wf-new-gvpb') ? document.getElementById('wf-new-gvpb').value : "";
                    
                    if (newGvhd) {
                        const hd = window.mockData.Trangthaidetai.find(a => a.EmailSV.toLowerCase() === emailSV.toLowerCase() && a.Role === 'HD');
                        if (hd) hd.EmailGV = newGvhd;
                    }
                    if (newGvpb) {
                        const existingPB = window.mockData.Trangthaidetai.find(a => a.EmailSV.toLowerCase() === emailSV.toLowerCase() && a.Role === 'PB');
                        if (existingPB) {
                            existingPB.EmailGV = newGvpb;
                        } else {
                            window.mockData.Trangthaidetai.push({ 
                                EmailSV: emailSV, 
                                EmailGV: newGvpb, 
                                Role: 'PB', 
                                Location: 'Online', 
                                End: 'No',
                                FlowType: "KLTN",
                                Loai: "KLTN"
                            });
                        }
                    }
                }

                if (nextStatus === "TBM Phân công Hội đồng") {
                    hoso.Council = {
                        Chairman: document.getElementById('wf-hd-chairman').value,
                        Secretary: document.getElementById('wf-hd-secretary').value,
                        Member: document.getElementById('wf-hd-member').value,
                        Date: document.getElementById('wf-hd-date').value,
                        Time: document.getElementById('wf-hd-time').value,
                        Location: document.getElementById('wf-hd-loc').value
                    };
                }

                if (nextStatus === "Nhập điểm & BB HĐ") {
                    hoso.Score_GVHD = parseFloat(document.getElementById('wf-score-hd').value) || 0;
                    hoso.Score_GVPB = parseFloat(document.getElementById('wf-score-pb').value) || 0;
                    hoso.Score_CTHD = parseFloat(document.getElementById('wf-score-cthd').value) || 0;
                    hoso.Score_TVHD1 = parseFloat(document.getElementById('wf-score-tv1').value) || 0;
                    hoso.Score_TVHD2 = parseFloat(document.getElementById('wf-score-tv2').value) || 0;
                    hoso.Score_TVHD3 = parseFloat(document.getElementById('wf-score-tv3').value) || 0;
                    hoso.Score_TVHD4 = parseFloat(document.getElementById('wf-score-tv4').value) || 0;
                    
                    // Tính ĐIỂM TB: chỉ tính các ô đã nhập
                    const scores = [hoso.Score_GVHD, hoso.Score_GVPB, hoso.Score_CTHD, hoso.Score_TVHD1, hoso.Score_TVHD2, hoso.Score_TVHD3, hoso.Score_TVHD4].filter(s => s > 0);
                    hoso.Score = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : '0';
                    
                    hoso.BienBan = document.getElementById('wf-bienban').value;
                }

                if (nextStatus === "Xác nhận cuối") {
                    const c1 = document.getElementById('wf-confirm-hd')?.checked;
                    const c2 = document.getElementById('wf-confirm-chair')?.checked;
                    
                    if (role === 'Lecturer' && c1) {
                        hoso.Confirm_HD = true;
                        showToast("GVHD đã xác nhận bài sửa thành công!");
                    }
                    
                    if (c2) {
                        if (!hoso.Confirm_HD) return alert("Cần GVHD xác nhận bài sửa trước khi Chủ tịch chốt!");
                        hoso.Confirm_Chair = true;
                        hoso.ChinhSua = `Final_Fix_${emailSV.split('@')[0]}.zip`;
                        topic.Status = nextStatus;
                    } else if (role === 'Lecturer') {
                        window.saveData();
                        return; 
                    }
                }

                if (currentStatus === "Đăng ký BCTT" && document.getElementById('wf-rename')) {
                    const newTitle = document.getElementById('wf-rename').value;
                    if (newTitle) topic.TenDeTai = newTitle;
                }

                topic.Status = nextStatus;
                showToast("Thông báo: Trạng thái đã được cập nhật thành công.");
            }
            window.saveData();
        }
    }, actionLabel, "max-w-7xl");

    const saveBtn = document.getElementById('btn-save-modal-workflow');
    if (saveBtn) {
        saveBtn.textContent = actionLabel;
        if (!canAction) saveBtn.classList.add('hidden');
    }

    // Auto-calculate ĐIỂM TB khi nhập
    window._calcAvg = function() {
        const ids = ['wf-score-hd', 'wf-score-pb', 'wf-score-cthd', 'wf-score-tv1', 'wf-score-tv2', 'wf-score-tv3', 'wf-score-tv4'];
        const vals = ids.map(id => parseFloat(document.getElementById(id)?.value) || 0).filter(v => v > 0);
        const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '0';
        const el = document.getElementById('wf-score-avg');
        if (el) el.textContent = avg;
    };

    if (window.lucide) window.lucide.createIcons();
}

// ============================================================
// 1.1 BIÊN BẢN MODAL (Nhận xét & Yêu cầu chỉnh sửa)
// ============================================================
function showBienBanModal(emailSV, flowType) {
    const topic = window.mockData.TenDetai.find(t => t.EmailSV.toLowerCase() === emailSV.toLowerCase() && t.Role === flowType);
    const hoso = (window.mockData.Hoso || []).find(h => h.EmailSV.toLowerCase() === emailSV.toLowerCase());
    const svUser = window.mockData.Data.find(u => u.Email.toLowerCase() === emailSV.toLowerCase());

    const contentHtml = `
        <div class="space-y-6 text-slate-800 p-2">
            <div class="text-center space-y-1 mb-6">
                <p class="font-bold text-[10px] uppercase tracking-widest text-slate-400">ĐẠI HỌC SƯ PHẠM KỸ THUẬT TP.HCM</p>
                <p class="text-[9px] uppercase font-medium text-slate-500">KHOA KINH TẾ - NGÀNH KINH DOANH QUỐC TẾ</p>
                <div class="w-12 h-0.5 bg-indigo-500 mx-auto my-3"></div>
                <h3 class="font-black text-indigo-700 text-sm uppercase tracking-wider">BIÊN BẢN HỌP HỘI ĐỒNG ĐÁNH GIÁ KHÓA LUẬN</h3>
            </div>

            <div class="space-y-3">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-1 h-4 bg-indigo-600 rounded-full"></div>
                    <h4 class="font-bold text-xs uppercase tracking-tight text-slate-700">1. Thông tin chung</h4>
                </div>
                <div class="grid grid-cols-1 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                    <div>
                        <span class="text-[9px] text-indigo-400 font-black uppercase tracking-tighter block mb-0.5">Tên khóa luận:</span>
                        <p class="text-xs font-extrabold text-slate-800 leading-tight">${topic?.TenDeTai || '-'}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4 pt-2 border-t border-indigo-100/30">
                        <div>
                            <span class="text-[9px] text-indigo-400 font-black uppercase tracking-tighter block mb-0.5">Sinh viên thực hiện:</span>
                            <p class="text-xs font-bold text-slate-800">${svUser?.Ten || '-'}</p>
                        </div>
                        <div class="text-right">
                            <span class="text-[9px] text-indigo-400 font-black uppercase tracking-tighter block mb-0.5">MSSV:</span>
                            <p class="text-xs font-mono font-black text-indigo-600">${svUser?.MS || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-1 h-4 bg-indigo-600 rounded-full"></div>
                    <h4 class="font-bold text-xs uppercase tracking-tight text-slate-700">2. Nhận xét của các thành viên hội đồng:</h4>
                </div>
                <textarea id="bb-nhanxet" class="w-full min-h-[120px] p-4 text-xs border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium leading-relaxed bg-white shadow-sm" placeholder="Nhập nhận xét chi tiết của hội đồng...">${hoso?.NhanXetHoiDong || ''}</textarea>
            </div>

            <div class="space-y-2">
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-1 h-4 bg-indigo-600 rounded-full"></div>
                    <h4 class="font-bold text-xs uppercase tracking-tight text-slate-700">3. Yêu cầu chỉnh sửa:</h4>
                </div>
                <textarea id="bb-yeucau" class="w-full min-h-[100px] p-4 text-xs border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 font-medium leading-relaxed bg-white shadow-sm" placeholder="Nhập các yêu cầu bắt buộc SV phải chỉnh sửa...">${hoso?.YeuCauChinhSua || ''}</textarea>
            </div>

            <div class="flex justify-between items-center pt-4">
                <span class="text-[10px] font-bold text-slate-400 italic">Hệ thống quản lý UniThesis</span>
                <div class="text-right font-bold text-[10px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}
                </div>
            </div>
        </div>
    `;

    createModal('modal-bien-ban', 'BIÊN BẢN CHI TIẾT', contentHtml, () => {
        let hosoRec = window.mockData.Hoso.find(h => h.EmailSV.toLowerCase() === emailSV.toLowerCase());
        if (!hosoRec) {
            hosoRec = { EmailSV: emailSV, EmailGV: topic.EmailGV };
            window.mockData.Hoso.push(hosoRec);
        }

        hosoRec.NhanXetHoiDong = document.getElementById('bb-nhanxet').value;
        hosoRec.YeuCauChinhSua = document.getElementById('bb-yeucau').value;
        
        window.saveData();
        showToast("Đã lưu nội dung biên bản thành công!");
    }, 'Lưu Biên Bản');
}
window.showBienBanModal = showBienBanModal;

// ============================================================
// 2. DETAIL MODAL (View full thesis details)
// ============================================================
function showDetailModal(emailSV, flowType) {
    const topic = window.mockData.TenDetai.find(t => t.EmailSV.toLowerCase() === emailSV.toLowerCase() && t.Role === flowType);
    if (!topic) return;

    const hoso = (window.mockData.Hoso || []).find(h => h.EmailSV.toLowerCase() === emailSV.toLowerCase());
    
    const hdList = window.mockData.Trangthaidetai.filter(t => t.EmailSV.toLowerCase() === emailSV.toLowerCase() && t.Loai === flowType);
    let hdHtml = hdList.map(h => {
        const gv = window.mockData.Data.find(u => u.Email.toLowerCase() === h.EmailGV.toLowerCase());
        const gvInfo = (window.mockData.GVInfo || []).find(g => g.EmailGV.toLowerCase() === h.EmailGV.toLowerCase());
        return `
        <div class="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
            <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">${h.Role}</p>
                <p class="text-xs font-bold text-slate-800">${gvInfo ? `${(gvInfo.HocVi||[]).join(' ')} ${gvInfo.Name}` : h.EmailGV}</p>
            </div>
            <span class="text-[9px] font-mono text-slate-400 bg-slate-100 px-1 rounded">${gvInfo?.MSGV || '-'}</span>
        </div>
        `;
    }).join('');
    if (!hdHtml) hdHtml = '<p class="text-slate-400 italic text-xs p-2">Chưa phân công giảng viên</p>';

    const statusColor = topic.Status === "END" || topic.Status === "Xác nhận cuối" ? 'bg-emerald-500 text-white' : 
                       topic.Status === "KẾT THÚC (TRƯỢT)" ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white';

    const formHtml = `
        <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div class="${statusColor} p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                    <h4 class="text-white/80 text-[10px] font-bold uppercase tracking-widest">Trạng thái hiện tại</h4>
                    <p class="text-white text-lg font-black">${topic.Status}</p>
                </div>
                <i data-lucide="activity" class="w-8 h-8 text-white/20"></i>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h5 class="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><i data-lucide="info" class="w-3 h-3"></i> Thông tin đề tài</h5>
                    <div>
                        <p class="text-slate-900 font-bold leading-snug">${topic.TenDeTai}</p>
                        <div class="flex gap-2 mt-2">
                            <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">${topic.Loaidetai}</span>
                            <span class="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-medium">${topic.DotHK}</span>
                        </div>
                    </div>
                    <div class="pt-3 border-t border-slate-50">
                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Tóm tắt nội dung</p>
                        <p class="text-xs text-slate-600 italic line-clamp-3">${hoso?.Summary || "Chưa cập nhật..."}</p>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h5 class="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><i data-lucide="users" class="w-3 h-3"></i> Thành phần hướng dẫn</h5>
                    <div class="space-y-1">${hdHtml}</div>
                    
                    ${hoso?.Council ? `
                    <div class="pt-3 border-t border-slate-50">
                        <p class="text-[10px] font-bold text-rose-500 uppercase mb-1">Hội đồng bảo vệ</p>
                        <div class="text-[10px] text-slate-600 space-y-1 font-medium bg-rose-50/30 p-2 rounded-lg">
                            <div class="flex justify-between"><span>CT:</span> <b>${hoso.Council.Chairman}</b></div>
                            <div class="flex justify-between"><span>TK:</span> <b>${hoso.Council.Secretary}</b></div>
                            <div class="flex justify-between"><span>UV:</span> <b>${hoso.Council.Member}</b></div>
                            <div class="pt-1 mt-1 border-t border-rose-100 flex items-center gap-2 text-rose-700">
                                <i data-lucide="calendar" class="w-3 h-3"></i> ${hoso.Council.Date || '?'} | 
                                <i data-lucide="clock" class="w-3 h-3"></i> ${hoso.Council.Time || '?'} | 
                                <i data-lucide="map-pin" class="w-3 h-3"></i> ${hoso.Council.Location || '?'}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                    <h5 class="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2"><i data-lucide="award" class="w-3 h-3"></i> Kết quả & Điểm số</h5>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-slate-500">Tỷ lệ Turnitin:</span>
                            <span class="font-bold text-orange-600">${hoso?.Turnitin_Rate || '0'}%</span>
                        </div>
                        ${window.currentUser?.Role !== 'Student' ? `
                        <div class="grid grid-cols-3 gap-2 py-2 border-y border-indigo-100/30">
                            <div class="text-center"><span class="text-[9px] text-slate-400 block">GVHD</span><span class="font-bold text-slate-800">${hoso?.Score_HD || '-'}</span></div>
                            <div class="text-center"><span class="text-[9px] text-slate-400 block">GVPB</span><span class="font-bold text-slate-800">${hoso?.Score_PB || '-'}</span></div>
                            <div class="text-center"><span class="text-[9px] text-slate-400 block">HĐ</span><span class="font-bold text-slate-800">${hoso?.Score_Council || '-'}</span></div>
                        </div>
                        ` : `
                        <div class="py-2 border-y border-indigo-100/30">
                            <p class="text-[10px] text-slate-400 italic text-center">Điểm thành phần chỉ hiển thị cho Giảng viên</p>
                        </div>
                        `}
                        <div class="flex justify-between items-center pt-2">
                            <span class="text-xs font-black text-slate-900">ĐIỂM TỔNG KẾT:</span>
                            <span class="text-lg font-black text-emerald-600">${hoso?.Score || '-'}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h5 class="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><i data-lucide="file-text" class="w-3 h-3"></i> Hồ sơ tài liệu</h5>
                    <div class="space-y-2">
                        <a href="#" class="flex items-center gap-3 p-2 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                            <i data-lucide="file" class="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors"></i>
                            <span class="text-xs text-slate-600 group-hover:text-indigo-600 font-medium">${hoso?.BienBan || "Chưa nộp biên bản"}</span>
                        </a>
                        <a href="#" class="flex items-center gap-3 p-2 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors group">
                            <i data-lucide="check-circle" class="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors"></i>
                            <span class="text-xs text-slate-600 group-hover:text-emerald-600 font-medium">${hoso?.ChinhSua || "Chưa nộp bản sửa cuối"}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    createModal('modal-view-detail', 'Chi Tiết Tiến Độ Hồ Sơ', formHtml, () => {}, "Đóng", "max-w-3xl");
    if (window.lucide) window.lucide.createIcons();
}

// ============================================================
// 3. REGISTER THESIS MODAL (SV đăng ký BCTT/KLTN)
// ============================================================
function showRegisterThesisModal() {
    if (!window.currentUser) return;

    const oldAssignment = window.mockData.Trangthaidetai.find(a => a.EmailSV.toLowerCase() === window.currentUser.Email.toLowerCase() && a.Loai === 'BCTT');
    const oldGvhd = oldAssignment ? oldAssignment.EmailGV : "";
    
    // Yêu cầu: Bắt buộc đăng ký BCTT trước khi ĐK KLTN
    const hasBCTT = window.mockData.TenDetai.some(t => t.EmailSV && t.EmailSV.toLowerCase() === window.currentUser.Email.toLowerCase() && t.Role === 'BCTT');

    // Dữ liệu cho Dropdown Tên Đề tài (lấy từ Detaigoiy = Tendetai)
    const rawTitles = window.mockData.TenDetai.map(t => t.TenDeTai || t.Tendetai).filter(t => t && t !== "Chưa có tên đề tài");
    const uniqueTitles = [...new Set(rawTitles)];
    
    // Nếu data chưa có công ty nào, mock 1 số công ty IT phổ biến
    const rawCompanies = window.mockData.TenDetai.map(t => t.TenCongTy).filter(t => t && t !== "N/A" && t !== "-");
    let uniqueCompanies = [...new Set(rawCompanies)];
    if (uniqueCompanies.length === 0) {
        uniqueCompanies = ["FPT Software", "VNG Corporation", "Nashtech", "TMA Solutions", "KMS Technology", "Momo", "Shopee", "Trường Đại học Sư phạm Kỹ thuật TP.HCM"];
    }

    const titleOptions = uniqueTitles.map(t => `<option value="${t.replace(/"/g, '&quot;')}">${t}</option>`).join('');
    const compOptions = uniqueCompanies.map(c => `<option value="${c.replace(/"/g, '&quot;')}">${c}</option>`).join('');

    const lecturers = window.mockData.Data.filter(u => u.Role === 'Lecturer');
    
    const getLectOptions = (filterField = "") => {
        let list = [...lecturers];
        if (filterField) {
            list.sort((a, b) => {
                const aMatch = (a.Major || "").toLowerCase().includes(filterField.toLowerCase());
                const bMatch = (b.Major || "").toLowerCase().includes(filterField.toLowerCase());
                return bMatch - aMatch;
            });
        }
        return list.map(l => {
            const isOld = l.Email === oldGvhd ? " (GVHD cũ)" : "";
            const fieldInfo = l.Major ? ` [${l.Major}]` : "";
            const selected = l.Email === oldGvhd ? "selected" : "";
            return `<option value="${l.Email}" ${selected}>${l.Email.split('@')[0]}${isOld}${fieldInfo}</option>`;
        }).join('');
    };

    const formHtml = `
        <div class="space-y-4 text-left">
            <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-4">
                <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Gợi ý hệ thống</p>
                <p class="text-xs text-indigo-800">${oldGvhd ? `Chúng tôi nhận thấy <b>${oldGvhd}</b> đã hướng dẫn bạn ở đợt BCTT.` : 'Chào mừng bạn đăng ký đợt mới.'}</p>
            </div>

            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Loại hình</label>
                <select id="reg-type" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium">
                    <option value="BCTT">Đăng ký BCTT (Thực tập)</option>
                    ${hasBCTT ? `<option value="KLTN" ${oldGvhd ? 'selected' : ''}>Đăng ký KLTN (Khóa luận)</option>` : `<option value="KLTN" disabled>Đăng ký KLTN (Bắt buộc phải có BCTT trước)</option>`}
                </select>
                ${!hasBCTT ? '<p class="text-[10px] text-rose-500 mt-1 italic">* Hệ thống khóa tùy chọn KLTN vì bạn chưa từng đăng ký BCTT.</p>' : ''}
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                    <label class="block text-sm font-bold text-slate-700 mb-1">Tên đề tài</label>
                    <select id="reg-title" class="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none bg-white">
                        <option value="">-- Chọn đề tài gợi ý --</option>
                        ${titleOptions}
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Tên công ty (Ứng dụng)</label>
                    <select id="reg-congty" class="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none bg-white">
                        <option value="">-- Chọn công ty --</option>
                        ${compOptions}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Đợt đăng ký</label>
                    <select id="reg-dot" class="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none font-medium text-indigo-700 bg-indigo-50">
                        <option value="Đợt 1 HK1 26-27">Đợt 1 HK1 26-27</option>
                        <option value="Đợt 2 HK1 26-27">Đợt 2 HK1 26-27</option>
                    </select>
                </div>
            </div>

            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Giảng viên hướng dẫn (Đã tự lọc theo mảng)</label>
                <select id="reg-gvhd" class="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none">
                    ${getLectOptions()}
                </select>
            </div>
        </div>
    `;

    window.updateLecturerFilter = function(val) {
        const select = document.getElementById('reg-gvhd');
        if (select) select.innerHTML = getLectOptions(val);
    };

    createModal('modal-register-thesis', 'Form Đăng Ký Hệ Thống', formHtml, () => {
        const type = document.getElementById('reg-type').value;
        const title = document.getElementById('reg-title').value;
        const mangElem = document.getElementById('reg-mang');
        const mang = mangElem ? mangElem.value : "Chưa xác định";
        const congty = document.getElementById('reg-congty').value;
        const dot = document.getElementById('reg-dot').value;
        const gvhd = document.getElementById('reg-gvhd').value;

        if (!title) return alert("Vui lòng chọn tên đề tài!");

        window.mockData.TenDetai.push({
            EmailSV: window.currentUser.Email,
            TenDeTai: title,
            MangDeTai: mang || "Chưa xác định",
            TenCongTy: congty || "N/A",
            DotHK: dot,
            Loaidetai: type,
            FlowType: type,
            Major: window.currentUser.Major || "QLCN",
            HeDaoTao: window.currentUser.HeDaoTao || "CLC",
            Status: (type === "BCTT") ? "Đăng ký BCTT" : "Đăng ký KLTN",
            Role: type,
            EmailGV: gvhd
        });

        window.mockData.Trangthaidetai.push({
            EmailSV: window.currentUser.Email,
            EmailGV: gvhd,
            Role: "HD",
            Location: "Online",
            End: "No",
            Loai: type,
            FlowType: type
        });

        window.saveData();
        alert("Đã đăng ký thành công!");
    });
    if (window.lucide) window.lucide.createIcons();
}

// ============================================================
// 4. EDIT QUOTA MODAL
// ============================================================
function showEditQuotaModal(email, major, currQuota) {
    const formHtml = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Giảng viên</label>
                <input type="text" value="${email}" disabled class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Cập nhật Quota (${major})</label>
                <input type="number" id="quota-value" value="${currQuota}" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
        </div>
    `;
    
    createModal('modal-edit-quota', 'Cập Nhật Quota Giảng Viên', formHtml, () => {
        const newVal = document.getElementById('quota-value').value;
        if (newVal) {
            const quotaObj = window.mockData.Quota.find(q => q.EmailGV === email && q.Major === major);
            if (quotaObj) {
                quotaObj.Quota = parseInt(newVal);
                window.saveData();
            }
        }
    });
}

// ============================================================
// 5. EXPORT CSV
// ============================================================
function exportToCSV(tableTarget) {
    let dataList = [];
    let filename = '';

    if (tableTarget === 'users') {
        dataList = window.mockData.Data;
        filename = 'Users_Data.csv';
    } else if (tableTarget === 'theses') {
        dataList = window.mockData.TenDetai;
        filename = 'Theses_Data.csv';
    } else {
        alert('Table export chưa cấu hình!');
        return;
    }

    if (!dataList || dataList.length === 0) {
        alert("Không có dữ liệu để xuất");
        return;
    }

    const keys = Object.keys(dataList[0]);
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += keys.join(",") + "\n";

    dataList.forEach(row => {
        let rowData = keys.map(k => `"${(row[k] || '').toString().replace(/"/g, '""')}"`).join(",");
        csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================================
// 6. BATCH APPROVE
// ============================================================
function batchApproveSelected() {
    const selected = document.querySelectorAll('.approval-checkbox:checked');
    if (selected.length === 0) return alert("Vui lòng chọn ít nhất một đề tài!");

    if (confirm(`Bạn có chắc muốn duyệt HÀNG LOẠT cho ${selected.length} đề tài đã chọn?`)) {
        selected.forEach(cb => {
            const email = cb.getAttribute('data-email');
            const flow = cb.getAttribute('data-flow');
            const topic = window.mockData.TenDetai.find(t => t.EmailSV === email && t.Role === flow);
            
            if (topic) {
                let nStatus = "";
                if (topic.Status === "Đăng ký BCTT") nStatus = "Xác nhận đề tài";
                else if (topic.Status === "Đăng ký KLTN") nStatus = "GVHD Duyệt";
                else if (topic.Status === "GVHD Duyệt") nStatus = "TBM Phân công PB";
                
                if (nStatus) {
                    topic.Status = nStatus;
                    // Đồng bộ trạng thái vào Trangthaidetai nếu cần
                    const st = window.mockData.Trangthaidetai.find(a => a.EmailSV === email && a.Loai === flow);
                    if (st) st.TrangThai = nStatus;
                }
            }
        });
        window.saveData();
        showToast(`Đã duyệt hàng loạt ${selected.length} đề tài thành công!`);
    }
}
