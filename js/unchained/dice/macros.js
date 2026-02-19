import { App } from '../appState.js';
import { t } from '../i18n.js';
import { generateUUID } from '../utils.js';
import { getSelectedTargets } from '../ui/recipients.js';
import { getMyDisplayName } from '../identity.js';
import { addDiceMessage } from '../chat/render.js';

const { dom, state } = App;

export function loadMacros() {
    const saved = localStorage.getItem('rpg_p2p_macros');
    if (saved) {
        try {
            state.macros = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading macros', e);
        }
    }
}

function saveMacrosToStorage() {
    localStorage.setItem('rpg_p2p_macros', JSON.stringify(state.macros));
    renderMacroButtons();
}

export function openMacroEditor(isNew, macroIndex = null) {
    state.editingMacroId = isNew ? null : macroIndex;

    if (isNew) {
        state.editorState = { name: '', icon: '⚔️', keep: [], threshold: [], sum: [] };
    } else {
        state.editorState = JSON.parse(JSON.stringify(state.macros[macroIndex]));
    }

    if (!Array.isArray(state.editorState.keep)) state.editorState.keep = [];
    if (!Array.isArray(state.editorState.threshold)) state.editorState.threshold = [];
    if (!Array.isArray(state.editorState.sum)) state.editorState.sum = [];

    if (state.editorState.keep.length === 0) {
        if (Array.isArray(state.editorState.highest) && state.editorState.highest.length > 0) {
            state.editorState.keep = [...state.editorState.highest];
            const keepModeEl = document.getElementById('keep-mode');
            if (keepModeEl) keepModeEl.value = 'highest';
        } else if (Array.isArray(state.editorState.lowest) && state.editorState.lowest.length > 0) {
            state.editorState.keep = [...state.editorState.lowest];
            const keepModeEl = document.getElementById('keep-mode');
            if (keepModeEl) keepModeEl.value = 'lowest';
        }
    }

    document.getElementById('macro-name').value = state.editorState.name;
    document.getElementById('macro-icon').value = state.editorState.icon;
    selectZone('sum');
    renderEditorZones();
    dom.macroEditor.classList.remove('hidden');
}

export function closeMacroEditor() {
    dom.macroEditor.classList.add('hidden');
}

export function selectZone(zone) {
    state.selectedZone = zone;
    dom.zoneKeep.classList.remove('active');
    dom.zoneThreshold.classList.remove('active');
    dom.zoneSum.classList.remove('active');

    if (zone === 'keep') dom.zoneKeep.classList.add('active');
    if (zone === 'threshold') dom.zoneThreshold.classList.add('active');
    if (zone === 'sum') dom.zoneSum.classList.add('active');
}

export function addDieToSelectedZone(sides) {
    if (state.selectedZone === 'keep') state.editorState.keep.push({ type: 'die', sides: sides });
    if (state.selectedZone === 'threshold') state.editorState.threshold.push({ type: 'die', sides: sides });
    if (state.selectedZone === 'sum') state.editorState.sum.push({ type: 'die', sides: sides });
    renderEditorZones();
}

export function addGroupToSum(type) {
    if (type === 'keep' && state.editorState.keep.length > 0) {
        const mode = document.getElementById('keep-mode')?.value === 'lowest' ? 'lowest' : 'highest';
        state.editorState.sum.push({ type: 'group', mode, items: [...state.editorState.keep] });
        state.editorState.keep = [];
    }

    if (type === 'threshold' && state.editorState.threshold.length > 0) {
        const compareRaw = document.getElementById('threshold-compare')?.value;
        const compare = compareRaw === 'lte' ? 'lte' : 'gte';
        const target = parseInt(document.getElementById('threshold-target')?.value);
        if (Number.isNaN(target)) return;

        state.editorState.sum.push({ type: 'threshold', compare, target, items: [...state.editorState.threshold] });
        state.editorState.threshold = [];
    }
    renderEditorZones();
}

export function addModToSum() {
    const val = parseInt(document.getElementById('mod-input').value);
    if (!isNaN(val)) {
        state.editorState.sum.push({ type: 'mod', value: val });
        document.getElementById('mod-input').value = '';
        renderEditorZones();
    }
}

export function removeFromZone(zone, index) {
    if (zone === 'keep') state.editorState.keep.splice(index, 1);
    if (zone === 'threshold') state.editorState.threshold.splice(index, 1);
    if (zone === 'sum') state.editorState.sum.splice(index, 1);
    renderEditorZones();
}

function renderEditorZones() {
    const renderItem = (item, z, i) => {
        if (item.type === 'die') return `<div onclick="event.stopPropagation(); window.removeFromZone('${z}', ${i})" class="bg-zinc-700 px-2 rounded text-xs hover:bg-red-900 cursor-pointer">d${item.sides}</div>`;
        if (item.type === 'mod') return `<div onclick="event.stopPropagation(); window.removeFromZone('${z}', ${i})" class="bg-zinc-600 px-2 rounded text-xs hover:bg-red-900 cursor-pointer">${item.value >= 0 ? '+' + item.value : item.value}</div>`;
        if (item.type === 'group') {
            const content = item.items.map(sub => `d${sub.sides}`).join(',');
            return `<div onclick="event.stopPropagation(); window.removeFromZone('${z}', ${i})" class="bg-zinc-900 border border-zinc-600 px-2 rounded text-[10px] hover:bg-red-900 cursor-pointer flex flex-col items-center"><span>${item.mode === 'highest' ? 'Maior' : 'Menor'}</span><span class="text-zinc-400">(${content})</span></div>`;
        }
        if (item.type === 'threshold') {
            const content = item.items.map(sub => `d${sub.sides}`).join(',');
            const label = item.compare === 'lte' ? '≤' : '≥';
            return `<div onclick="event.stopPropagation(); window.removeFromZone('${z}', ${i})" class="bg-zinc-900 border border-zinc-600 px-2 rounded text-[10px] hover:bg-red-900 cursor-pointer flex flex-col items-center"><span>Threshold (${label}${item.target})</span><span class="text-zinc-400">(${content})</span></div>`;
        }
        return '';
    };

    dom.zoneKeep.innerHTML = state.editorState.keep.map((it, i) => renderItem(it, 'keep', i)).join('');
    dom.zoneThreshold.innerHTML = state.editorState.threshold.map((it, i) => renderItem(it, 'threshold', i)).join('');
    dom.zoneSum.innerHTML = state.editorState.sum.map((it, i) => renderItem(it, 'sum', i)).join('');
}

export function saveMacro() {
    const name = document.getElementById('macro-name').value.trim() || 'Macro';
    state.editorState.name = name;
    state.editorState.icon = document.getElementById('macro-icon').value;

    if (state.editingMacroId !== null) {
        state.macros[state.editingMacroId] = state.editorState;
    } else {
        state.macros.push(state.editorState);
    }

    saveMacrosToStorage();
    closeMacroEditor();
}

export function deleteMacro() {
    if (state.editingMacroId !== null) {
        if (confirm('Tem certeza que deseja apagar este macro?')) {
            state.macros.splice(state.editingMacroId, 1);
            saveMacrosToStorage();
            closeMacroEditor();
        }
    }
}

export function exportMacro() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.editorState));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', (state.editorState.name || 'macro') + '.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export function importMacro() {
    document.getElementById('macro-file-input').click();
}

export function handleFileImport(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.sum && Array.isArray(imported.sum)) {
                state.editorState = imported;
                document.getElementById('macro-name').value = state.editorState.name;
                document.getElementById('macro-icon').value = state.editorState.icon;
                renderEditorZones();
            } else {
                alert(t('system.invalidFile'));
            }
        } catch (err) {
            alert(t('system.invalidFile'));
        }
    };
    reader.readAsText(file);
    input.value = '';
}

export function renderMacroButtons() {
    dom.macrosContainer.innerHTML = state.macros.map((m, i) => {
        return `<button 
            onclick="window.rollMacro(event, ${i})" 
            oncontextmenu="event.preventDefault(); window.openMacroEditor(false, ${i})"
            class="macro-btn dice-btn bg-zinc-800 hover:bg-zinc-700 border border-amber-900/50 p-2 rounded flex flex-col items-center min-w-[45px] relative"
            title="${m.name} (${t('chat.macroHoldToEdit')})">
            <span class="text-[10px] text-amber-500 truncate max-w-[40px]">${m.name}</span>
            <span class="text-base">${m.icon}</span>
        </button>`;
    }).join('');

    document.querySelectorAll('.macro-btn').forEach((btn, i) => {
        let pressTimer;
        const start = (e) => {
            if (e.type === 'click') return;
            pressTimer = setTimeout(() => {
                openMacroEditor(false, i);
                if (navigator.vibrate) navigator.vibrate(50);
            }, 2000);
        };
        const cancel = () => clearTimeout(pressTimer);

        btn.addEventListener('mousedown', start);
        btn.addEventListener('touchstart', start, { passive: true });
        btn.addEventListener('mouseup', cancel);
        btn.addEventListener('mouseleave', cancel);
        btn.addEventListener('touchend', cancel);
    });

    updateMacroVisibility();
}

export function rollMacro(e, index) {
    const macro = state.macros[index];
    if (!macro) return;

    let totalSum = 0;
    const breakdownParts = [];

    let mode = document.querySelector('input[name="roll-mode"]:checked').value;
    if (e && e.ctrlKey) mode = 'gm';
    else if (e && e.shiftKey) mode = 'blind';

    macro.sum.forEach(item => {
        if (item.type === 'die') {
            const val = Math.floor(Math.random() * item.sides) + 1;
            totalSum += val;
            breakdownParts.push(`d${item.sides}(<b class="text-amber-400">${val}</b>)`);
        } else if (item.type === 'mod') {
            totalSum += item.value;
            breakdownParts.push(`${item.value >= 0 ? '+' : ''}${item.value}`);
        } else if (item.type === 'group') {
            const rolls = item.items.map(sub => Math.floor(Math.random() * sub.sides) + 1);
            let selected = 0;
            if (item.mode === 'highest') selected = Math.max(...rolls);
            else selected = Math.min(...rolls);

            totalSum += selected;
            const rollsStr = rolls.map(r => r === selected ? `<b class="text-amber-400">${r}</b>` : `<span class="opacity-50">${r}</span>`).join(',');
            breakdownParts.push(`[${item.mode === 'highest' ? 'Maior' : 'Menor'}(${rollsStr}) → <b>${selected}</b>]`);
        } else if (item.type === 'threshold') {
            const compare = item.compare === 'lte' ? 'lte' : 'gte';
            const target = parseInt(item.target);
            if (!Array.isArray(item.items) || Number.isNaN(target)) return;

            const rolls = item.items.map(sub => Math.floor(Math.random() * sub.sides) + 1);
            const successes = rolls.map((r) => {
                if (compare === 'lte') return r <= target;
                return r >= target;
            });
            const successCount = successes.reduce((acc, ok) => acc + (ok ? 1 : 0), 0);

            totalSum += successCount;
            const symbol = compare === 'lte' ? '≤' : '≥';
            const rollsStr = rolls.map((r, idx) => successes[idx] ? `<b class="text-amber-400">${r}</b>` : `<span class="opacity-50">${r}</span>`).join(',');
            breakdownParts.push(`[Threshold (${symbol}${target})(${rollsStr}) → <b>${successCount}</b>]`);
        }
    });

    const resultHtml = `<div class="text-sm font-normal text-zinc-300 mt-1">${breakdownParts.join(' + ')} =</div><div class="text-xl font-bold text-amber-500">${totalSum}</div>`;
    const myName = getMyDisplayName();

    let targets = ['all'];
    if (mode === 'open') targets = ['all'];
    else if (mode === 'gm') targets = state.isHost ? [state.myPeerId] : (state.conn ? [state.conn.peer, state.myPeerId] : [state.myPeerId]);
    else if (mode === 'blind') targets = state.isHost ? [state.myPeerId] : (state.conn ? [state.conn.peer] : [state.myPeerId]);
    else if (mode === 'group') targets = getSelectedTargets();
    else if (mode === 'self') targets = [state.myPeerId];

    const payload = {
        id: generateUUID(),
        type: 'dice',
        sender: myName,
        senderId: state.myPeerId,
        dice: `Macro: ${macro.name}`,
        result: resultHtml,
        targets: targets,
        rollMode: mode,
        timestamp: Date.now()
    };

    if (state.isHost && typeof state.handleData === 'function') {
        state.handleData(payload);
    } else if (state.conn && state.conn.open) {
        state.conn.send(payload);
        if (mode === 'blind' && !state.isHost) {
            const diceData = { ...payload, result: '?? (Cegas)', sender: myName };
            addDiceMessage(diceData);
        } else if (!targets.includes(state.myPeerId) && mode !== 'blind') {
            const diceData = { ...payload, sender: myName + (mode === 'gm' ? ' (Privado)' : '') };
            addDiceMessage(diceData);
        }
    } else {
        addDiceMessage(payload);
    }
}

export function updateMacroVisibility() {
    const hasMacros = state.macros.length > 0;
    if (hasMacros) {
        dom.toggleMacrosBtn.classList.remove('hidden');
        if (state.showMacros) {
            dom.macrosWrapper.classList.remove('hidden');
            dom.toggleMacrosBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            dom.toggleMacrosBtn.classList.replace('text-zinc-600', 'text-zinc-500');
        } else {
            dom.macrosWrapper.classList.add('hidden');
            dom.toggleMacrosBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
            dom.toggleMacrosBtn.classList.replace('text-zinc-500', 'text-zinc-600');
        }
    } else {
        dom.toggleMacrosBtn.classList.add('hidden');
        dom.macrosWrapper.classList.remove('hidden');
    }
}

export function bindMacroToggle() {
    const savedMacrosState = localStorage.getItem('rpg_p2p_show_macros');
    if (savedMacrosState !== null) {
        state.showMacros = savedMacrosState === 'true';
    }

    dom.toggleMacrosBtn.onclick = () => {
        state.showMacros = !state.showMacros;
        localStorage.setItem('rpg_p2p_show_macros', state.showMacros);
        updateMacroVisibility();
    };
}
