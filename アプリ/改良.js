// --- DATA STORE ---
const initialDishes = [
    {
        id: 'roastbeef',
        name: 'ローストビーフ',
        category: 'メイン料理',
        status: 'red', // red, orange, green
        statusLabel: '補充通知送信済み',
        percent: 15,
        speedText: '減り速度: 極めて速い',
        infoBox: 'キッチンにて追加調理中（あと3分）',
        infoBoxType: 'red',
        actionBtnText: '再督促通知',
        threshold: 20,
        speedAlert: '有効 (高感度)',
        endMode: 'OFF (09:30自動ON)',
        history: [
            { time: '08:14', event: '自動要請 (15%)', result: '15% (対応中)', staff: 'システム', alert: true },
            { time: '07:42', event: '補充完了', result: '18% → 100%', staff: 'シェフ佐藤', alert: false }
        ],
        graphData: [85, 78, 82, 60, 75, 40, 30, 15]
    },
    {
        id: 'scrambledegg',
        name: 'スクランブルエッグ',
        category: '温菜エリア',
        status: 'orange',
        statusLabel: '要注意',
        percent: 30,
        speedText: '減り速度: やや速い',
        infoBox: '準備パラメータ到達',
        infoBoxType: 'orange',
        actionBtnText: '手動補充要請',
        threshold: 30,
        speedAlert: '有効 (標準)',
        endMode: 'OFF (09:30自動ON)',
        history: [
            { time: '08:05', event: '準備パラメータ到達', result: '30%', staff: 'システム', alert: false },
            { time: '07:15', event: '補充完了', result: '20% → 100%', staff: 'スタッフ田中', alert: false }
        ],
        graphData: [90, 85, 70, 65, 50, 42, 35, 30]
    },
    {
        id: 'saladmix',
        name: '新鮮サラダミックス',
        category: '冷菜エリア',
        status: 'green',
        statusLabel: '適正',
        percent: 75,
        speedText: '減り速度: 安定',
        infoBox: null,
        infoBoxType: null,
        actionBtnText: '補充不要',
        threshold: 25,
        speedAlert: '有効 (標準)',
        endMode: 'OFF (09:30自動ON)',
        history: [
            { time: '07:30', event: '定期補充', result: '40% → 100%', staff: 'スタッフ鈴木', alert: false }
        ],
        graphData: [100, 95, 90, 85, 80, 78, 76, 75]
    },
    {
        id: 'croissant',
        name: '焼きたてクロワッサン',
        category: 'ベーカリー',
        status: 'green',
        statusLabel: '適正',
        percent: 85,
        speedText: '減り速度: 安定',
        infoBox: null,
        infoBoxType: null,
        actionBtnText: '補充不要',
        threshold: 20,
        speedAlert: '有効 (低感度)',
        endMode: 'OFF (09:30自動ON)',
        history: [
            { time: '07:50', event: '焼き上がり追加', result: '50% → 100%', staff: 'ベーカリー係', alert: false }
        ],
        graphData: [100, 98, 95, 92, 90, 88, 86, 85]
    },
    {
        id: 'fruits',
        name: '季節のフルーツ盛り',
        category: 'デザート',
        status: 'orange',
        statusLabel: '要注意',
        percent: 35,
        speedText: '減り速度: やや速い',
        infoBox: '次回カット準備推奨',
        infoBoxType: 'orange',
        actionBtnText: '手動補充要請',
        threshold: 30,
        speedAlert: '有効 (標準)',
        endMode: 'OFF (09:30自動ON)',
        history: [
            { time: '08:10', event: '警告判定発動', result: '35%', staff: 'システム', alert: false }
        ],
        graphData: [80, 75, 65, 55, 48, 42, 38, 35]
    },
    {
        id: 'potage',
        name: 'コーンポタージュ',
        category: 'スープ',
        status: 'green',
        statusLabel: '適正',
        percent: 60,
        speedText: '減り速度: 安定',
        infoBox: null,
        infoBoxType: null,
        actionBtnText: '補充不要',
        threshold: 20,
        speedAlert: '有効 (標準)',
        endMode: 'OFF (09:30自動ON)',
        history: [
            { time: '07:00', event: '初期設置', result: '100%', staff: 'シェフ佐藤', alert: false }
        ],
        graphData: [100, 92, 85, 78, 72, 68, 64, 60]
    }
];

let state = {
    view: 'dashboard', 
    selectedDishId: 'roastbeef',
    dishes: JSON.parse(JSON.stringify(initialDishes)),
    isSynced: true
};

// --- RENDER FUNCTIONS ---

function render() {
    const app = document.getElementById('app');
    if (state.view === 'dashboard') {
        app.innerHTML = renderDashboard();
    } else {
        app.innerHTML = renderDetail();
        setTimeout(drawChart, 50); 
    }
    lucide.createIcons();
}

// --- DASHBOARD VIEW ---
function renderDashboard() {
    return `
        <div class="max-w-7xl mx-auto px-4 pt-6">
            <div class="header-bg text-white rounded-lg p-4 mb-6 flex flex-wrap justify-between items-center shadow-lg gap-4">
                <div class="flex items-center gap-4">
                    <h1 class="text-xl md:text-2xl font-bold tracking-wide">ビュッフェ残量監視画面（ホール・共通用）</h1>
                    <span class="text-xs md:text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">朝食ビュッフェ 08:15 現在</span>
                </div>
                <div class="flex items-center gap-3">
                    <!-- 追加: センサー接続ボタン -->
                    <button onclick="connectSerial()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm px-4 py-1.5 rounded-md font-medium transition shadow flex items-center gap-1">
                        <i data-lucide="plug" class="w-4 h-4"></i> センサー接続
                    </button>
                    
                    <span class="flex items-center text-xs md:text-sm bg-emerald-900/80 text-emerald-300 px-3 py-1.5 rounded-md font-medium border border-emerald-700">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                        リアルタイム同期中
                    </span>
                    <button onclick="openThresholdModal()" class="bg-sky-600 hover:bg-sky-500 text-white text-xs md:text-sm px-4 py-1.5 rounded-md font-medium transition shadow">
                        しきい値設定
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${state.dishes.map(dish => renderDishCard(dish)).join('')}
            </div>
        </div>
    `;
}

function renderDishCard(dish) {
    let borderClass = 'card-border-green';
    let statusBadge = '<span class="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-semibold">適正</span>';
    let barColor = 'bg-emerald-500';
    let percentColor = 'text-slate-800';
    let speedColor = 'text-emerald-600';

    if (dish.status === 'red') {
        borderClass = 'card-border-red';
        statusBadge = `<span class="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3"></i> 補充通知送信済み</span>`;
        barColor = 'bg-red-500';
        percentColor = 'text-red-600';
        speedColor = 'text-red-500';
    } else if (dish.status === 'orange') {
        borderClass = 'card-border-orange';
        statusBadge = `<span class="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1"><i data-lucide="zap" class="w-3 h-3"></i> 要注意</span>`;
        barColor = 'bg-amber-500';
        percentColor = 'text-slate-900';
        speedColor = 'text-amber-600';
    }

    let infoBoxHtml = '';
    if (dish.infoBox) {
        const boxBg = dish.infoBoxType === 'red' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-800 border-amber-100';
        infoBoxHtml = `<div class="${boxBg} border text-center text-xs py-2 rounded-md font-medium my-2">${dish.infoBox}</div>`;
    } else {
        infoBoxHtml = `<div class="h-9 my-2"></div>`; 
    }

    let actionButton = '';
    if (dish.status === 'red') {
        actionButton = `<button onclick="requestRefill('${dish.id}', true)" class="w-1/2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded shadow transition">再督促通知</button>`;
    } else if (dish.status === 'orange') {
        actionButton = `<button onclick="requestRefill('${dish.id}', false)" class="w-1/2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded shadow transition">手動補充要請</button>`;
    } else {
        actionButton = `<button disabled class="w-1/2 bg-slate-100 text-slate-400 text-xs font-bold py-2 px-3 rounded cursor-not-allowed">補充不要</button>`;
    }

    return `
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between ${borderClass}">
            <div>
                <div class="flex justify-between items-start mb-2">
                    <div>${statusBadge}</div>
                    <span class="text-xs text-slate-400 font-medium">${dish.category}</span>
                </div>
                
                <h2 class="text-lg font-bold text-slate-800 mb-4">${dish.name}</h2>

                <div class="flex items-baseline gap-3 mb-2">
                    <span class="text-4xl font-extrabold ${percentColor}">${dish.percent}%</span>
                    <span class="text-xs font-medium ${speedColor}">${dish.speedText}</span>
                </div>

                <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                    <div class="${barColor} h-full rounded-full transition-all duration-500" style="width: ${dish.percent}%"></div>
                </div>

                ${infoBoxHtml}
            </div>

            <div class="flex gap-2 pt-2">
                <button onclick="goToDetail('${dish.id}')" class="w-1/2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded shadow transition">
                    詳細・履歴
                </button>
                ${actionButton}
            </div>
        </div>
    `;
}

// --- DETAIL VIEW ---
function renderDetail() {
    const dish = state.dishes.find(d => d.id === state.selectedDishId);
    if (!dish) return '';

    let statusBadge = `<span class="bg-emerald-500 text-white text-xs md:text-sm px-4 py-1.5 rounded-md font-bold shadow-sm">ステータス: 良好</span>`;
    if (dish.status === 'red') {
        statusBadge = `<span class="bg-red-500 text-white text-xs md:text-sm px-4 py-1.5 rounded-md font-bold shadow-sm">ステータス: 補充対応中</span>`;
    } else if (dish.status === 'orange') {
        statusBadge = `<span class="bg-amber-500 text-white text-xs md:text-sm px-4 py-1.5 rounded-md font-bold shadow-sm">ステータス: 準備・確認推奨</span>`;
    }

    return `
        <div class="max-w-7xl mx-auto px-4 pt-6">
            <div class="header-bg text-white rounded-lg p-4 mb-6 flex flex-wrap justify-between items-center shadow-lg gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="goToDashboard()" class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs md:text-sm px-4 py-2 rounded-md font-medium transition flex items-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i> ダッシュボードへ戻る
                    </button>
                    <h1 class="text-lg md:text-xl font-bold tracking-wide">料理詳細・通知設定 : <span class="text-sky-300">${dish.name}</span></h1>
                </div>
                <div>
                    ${statusBadge}
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div class="lg:col-span-7 space-y-6">
                    
                    <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="font-bold text-slate-800 text-base">本日の残量推移グラフ（リアルタイム）</h2>
                            <span class="text-xs text-slate-400">07:00 〜 現在</span>
                        </div>
                        <div class="relative w-full h-56 bg-slate-50/50 rounded border border-slate-100 p-2">
                            <canvas id="dishChart" class="w-full h-full"></canvas>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                        <h2 class="font-bold text-slate-800 text-base mb-4">補充履歴（本日）</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr class="text-slate-400 border-b border-slate-200">
                                        <th class="pb-2 font-medium">時刻</th>
                                        <th class="pb-2 font-medium">イベント</th>
                                        <th class="pb-2 font-medium">補充前→後</th>
                                        <th class="pb-2 font-medium">担当</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 text-slate-700">
                                    ${dish.history.map(item => `
                                        <tr>
                                            <td class="py-3 font-semibold text-slate-800">${item.time}</td>
                                            <td class="py-3 ${item.alert ? 'text-red-600 font-bold' : ''}">${item.event}</td>
                                            <td class="py-3">${item.result}</td>
                                            <td class="py-3 text-slate-500">${item.staff}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <div class="lg:col-span-5 space-y-6">
                    
                    <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-100 space-y-5">
                        <h2 class="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">通知ルール・個別設定</h2>
                        
                        <div class="bg-slate-50 p-3.5 rounded-lg flex justify-between items-center">
                            <div>
                                <div class="font-bold text-xs text-slate-800">自動通知のしきい値</div>
                                <div class="text-[11px] text-slate-400">この残量を下回るとキッチンへ通知</div>
                            </div>
                            <select onchange="updateThreshold('${dish.id}', this.value)" class="bg-sky-600 text-white font-bold text-xs px-3 py-1.5 rounded cursor-pointer shadow-sm focus:outline-none">
                                <option value="15" ${dish.threshold == 15 ? 'selected' : ''}>15% ▼</option>
                                <option value="20" ${dish.threshold == 20 ? 'selected' : ''}>20% ▼</option>
                                <option value="25" ${dish.threshold == 25 ? 'selected' : ''}>25% ▼</option>
                                <option value="30" ${dish.threshold == 30 ? 'selected' : ''}>30% ▼</option>
                            </select>
                        </div>

                        <div class="bg-slate-50 p-3.5 rounded-lg flex justify-between items-center">
                            <div>
                                <div class="font-bold text-xs text-slate-800">減り速度の警告判定</div>
                                <div class="text-[11px] text-slate-400">急激な消費時に事前アラート</div>
                            </div>
                            <button class="bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded shadow-sm hover:bg-emerald-600 transition">
                                ${dish.speedAlert}
                            </button>
                        </div>

                        <div class="bg-slate-50 p-3.5 rounded-lg flex justify-between items-center">
                            <div>
                                <div class="font-bold text-xs text-slate-800">ビュッフェ終了間際モード</div>
                                <div class="text-[11px] text-slate-400">30分前は小盛り補充に切り替え</div>
                            </div>
                            <span class="bg-slate-200 text-slate-600 font-bold text-xs px-3 py-1.5 rounded">
                                ${dish.endMode}
                            </span>
                        </div>
                    </div>

                    <div class="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                        <div class="text-xs font-medium text-slate-400 mb-3">即時アクション操作</div>
                        <div class="flex gap-3">
                            <button onclick="triggerEmergency('${dish.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-md shadow transition text-center">
                                緊急調理要請
                            </button>
                            <button onclick="completeRefill('${dish.id}')" class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-md shadow transition text-center">
                                補充完了登録
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    `;
}

// --- CANVAS GRAPH DRAWING ---
function drawChart() {
    const canvas = document.getElementById('dishChart');
    if (!canvas) return;

    const dish = state.dishes.find(d => d.id === state.selectedDishId);
    if (!dish) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentNode.getBoundingClientRect();
    
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;
    const padding = 30;

    ctx.clearRect(0, 0, width, height);

    const thresholdY = height - padding - ((height - padding * 2) * (dish.threshold / 100));
    
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.moveTo(padding, thresholdY);
    ctx.lineTo(width - padding, thresholdY);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px Noto Sans JP';
    ctx.textAlign = 'right';
    ctx.fillText(`通知限界 (${dish.threshold}%)`, width - padding, thresholdY - 5);

    ctx.setLineDash([]);

    const points = dish.graphData;
    const stepX = (width - padding * 2) / (points.length - 1);

    ctx.beginPath();
    ctx.strokeStyle = '#0284c7'; 
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';

    points.forEach((val, idx) => {
        const x = padding + idx * stepX;
        const y = height - padding - ((height - padding * 2) * (val / 100));
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach((val, idx) => {
        const x = padding + idx * stepX;
        const y = height - padding - ((height - padding * 2) * (val / 100));

        ctx.beginPath();
        if (idx === points.length - 1 && val <= dish.threshold) {
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
        } else if (val === 100 || idx === 4) {
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#10b981';
        } else {
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#0284c7';
        }
        ctx.fill();
    });
}

// --- ACTIONS & HANDLERS ---

function goToDetail(dishId) {
    state.selectedDishId = dishId;
    state.view = 'detail';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToDashboard() {
    state.view = 'dashboard';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function requestRefill(dishId, isUrgent) {
    const dish = state.dishes.find(d => d.id === dishId);
    if (!dish) return;

    dish.status = 'red';
    dish.statusLabel = '補充通知送信済み';
    dish.infoBox = 'キッチンへ要請送信済み（対応待ち）';
    dish.infoBoxType = 'red';
    dish.actionBtnText = '再督促通知';

    const now = new Date().toTimeString().substring(0, 5);
    dish.history.unshift({
        time: now,
        event: isUrgent ? '再督促要請' : '手動補充要請',
        result: `${dish.percent}% (要請中)`,
        staff: 'ホールスタッフ',
        alert: true
    });

    showToast(isUrgent ? `【緊急】${dish.name} の再督促を送信しました` : `${dish.name} の補充要請をキッチンへ送信しました`);
    render();
}

function completeRefill(dishId) {
    const dish = state.dishes.find(d => d.id === dishId);
    if (!dish) return;

    const prevPercent = dish.percent;
    dish.percent = 100;
    dish.status = 'green';
    dish.statusLabel = '適正';
    dish.speedText = '減り速度: 安定';
    dish.infoBox = null;
    dish.infoBoxType = null;
    dish.actionBtnText = '補充不要';
    dish.graphData[dish.graphData.length - 1] = 100;

    const now = new Date().toTimeString().substring(0, 5);
    dish.history.unshift({
        time: now,
        event: '補充完了',
        result: `${prevPercent}% → 100%`,
        staff: 'ホール担当',
        alert: false
    });

    showToast(`${dish.name} の補充完了を登録しました (100%)`, 'success');
    render();
}

function triggerEmergency(dishId) {
    const dish = state.dishes.find(d => d.id === dishId);
    if (!dish) return;

    dish.status = 'red';
    dish.statusLabel = '補充通知送信済み';
    dish.infoBox = '【緊急】調理要請が送信されました';
    dish.infoBoxType = 'red';

    const now = new Date().toTimeString().substring(0, 5);
    dish.history.unshift({
        time: now,
        event: '緊急調理要請',
        result: `${dish.percent}% (至急)`,
        staff: 'ホール責任者',
        alert: true
    });

    showToast(`【緊急調理要請】${dish.name} をキッチンへ送信しました`, 'error');
    render();
}

function updateThreshold(dishId, value) {
    const dish = state.dishes.find(d => d.id === dishId);
    if (!dish) return;

    dish.threshold = parseInt(value, 10);
    showToast(`${dish.name} のしきい値を ${dish.threshold}% に変更しました`, 'info');
    render();
}

function openThresholdModal() {
    showToast('一括しきい値設定モーダル（設定画面）は準備中です。各料理の詳細画面から個別変更が可能です。', 'info');
}

// --- TOAST NOTIFICATION ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    let bg = 'bg-slate-800 text-white';
    if (type === 'success') bg = 'bg-emerald-600 text-white';
    if (type === 'error') bg = 'bg-red-600 text-white';

    toast.className = `pointer-events-auto flex items-center gap-2 ${bg} text-xs font-bold px-4 py-3 rounded-lg shadow-xl transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `<i data-lucide="bell" class="w-4 h-4"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --- RESIZE EVENT FOR GRAPH ---
window.addEventListener('resize', () => {
    if (state.view === 'detail') {
        drawChart();
    }
});

// --- INITIAL RENDER ---
window.onload = function() {
    render();
};

// ==========================================
// Web Serial API によるリアルタイム重量データ受信
// ==========================================

let port;
let reader;

async function connectSerial() {
    try {
        port = await navigator.serial.requestPort();
        
        await port.open({ baudRate: 115200 });
        showToast("重量センサーに接続しました", "success");

        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            buffer += value;
            const lines = buffer.split('\n');
            
            buffer = lines.pop(); 
            
            for (const line of lines) {
                processSensorData(line.trim());
            }
        }
    } catch (error) {
        console.error("シリアル接続エラー:", error);
        showToast("センサーとの接続がキャンセルされたか、エラーが発生しました", "error");
    }
}

function processSensorData(data) {
    if (!data.includes(':')) return;

    // 例: "roastbeef:85" -> id="roastbeef", value=85
    const [dishId, valueStr] = data.split(':');
    const newPercent = parseInt(valueStr, 10);

    if (isNaN(newPercent)) return;

    const dish = state.dishes.find(d => d.id === dishId);
    if (dish) {
        dish.percent = Math.min(100, Math.max(0, newPercent)); 

        if (dish.percent <= dish.threshold && dish.status === 'green') {
            dish.status = 'orange';
            dish.statusLabel = '要注意';
            dish.infoBox = 'センサー検知：残量低下';
            dish.infoBoxType = 'orange';
            showToast(`${dish.name} の残量がしきい値を下回りました`, "error");
        } else if (dish.percent > dish.threshold && (dish.status === 'orange' || dish.status === 'red')) {
            dish.status = 'green';
            dish.statusLabel = '適正';
            dish.infoBox = null;
            dish.infoBoxType = null;
        }

        dish.graphData.push(dish.percent);
        if (dish.graphData.length > 10) {
            dish.graphData.shift();
        }

        render();
    }
}