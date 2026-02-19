import { App } from '../appState.js';
import { t } from '../i18n.js';

const { dom, state } = App;

export function updateRecipientsUI() {
    dom.recipientsContainer.innerHTML = '<span class="text-zinc-500 mr-1 noselect">Chat Para:</span>';
    createCheckbox('all', 'Todos', true);
    state.knownPlayers.forEach(player => {
        const displayName = player.name;
        createCheckbox(player.id, displayName, true);
    });
}

export function createCheckbox(id, label, checked) {
    const labelEl = document.createElement('label');
    labelEl.className = 'cursor-pointer select-none inline-flex items-center noselect';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'recipient-checkbox hidden';
    input.value = id;
    input.checked = checked;
    const div = document.createElement('div');
    div.className = 'px-2 py-1 rounded border text-[10px] uppercase font-bold transition-colors border-zinc-700 noselect';
    div.innerText = label;

    input.onchange = () => handleRecipientChange(input);

    let pressTimer;
    let isLongPress = false;
    const selectOnly = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const allInputs = document.querySelectorAll('.recipient-checkbox');
        allInputs.forEach(i => { i.checked = (i.value === id); });
        div.classList.add('pulse-select');
        setTimeout(() => div.classList.remove('pulse-select'), 300);
    };

    labelEl.addEventListener('click', (e) => {
        if (e.ctrlKey) { selectOnly(e); return false; }
        if (isLongPress) { e.preventDefault(); isLongPress = false; }
    });

    const startPress = (e) => {
        isLongPress = false;
        if (e.type === 'mousedown' && e.button !== 0) return;
        pressTimer = setTimeout(() => {
            isLongPress = true;
            selectOnly(e);
            if (navigator.vibrate) navigator.vibrate(50);
        }, 2000);
    };

    const cancelPress = () => clearTimeout(pressTimer);

    labelEl.addEventListener('mousedown', startPress);
    labelEl.addEventListener('touchstart', startPress, { passive: false });
    labelEl.addEventListener('mouseup', cancelPress);
    labelEl.addEventListener('mouseleave', cancelPress);
    labelEl.addEventListener('touchend', cancelPress);

    labelEl.appendChild(input);
    labelEl.appendChild(div);
    dom.recipientsContainer.appendChild(labelEl);
}

export function handleRecipientChange(changedInput) {
    const allInputs = Array.from(document.querySelectorAll('.recipient-checkbox'));
    const allOption = allInputs.find(i => i.value === 'all');
    const otherInputs = allInputs.filter(i => i.value !== 'all');

    if (changedInput.value === 'all') {
        if (changedInput.checked) {
            otherInputs.forEach(i => i.checked = true);
        } else {
            otherInputs.forEach(i => i.checked = false);
            if (otherInputs.length > 0) otherInputs[0].checked = true;
        }
    } else {
        if (!changedInput.checked) {
            if (allOption) allOption.checked = false;
            const anyChecked = otherInputs.some(i => i.checked);
            if (!anyChecked && otherInputs.length > 0) otherInputs[0].checked = true;
        } else {
            const allOthersChecked = otherInputs.every(i => i.checked);
            if (allOthersChecked && allOption) allOption.checked = true;
        }
    }
}

export function getSelectedTargets() {
    const allInputs = Array.from(document.querySelectorAll('.recipient-checkbox'));
    const allOption = allInputs.find(i => i.value === 'all');
    if (allOption && allOption.checked) return ['all'];
    const selected = allInputs.filter(i => i.value !== 'all' && i.checked).map(i => i.value);
    return selected.length > 0 ? selected : ['all'];
}

export function resolveTargetNames(targetIds) {
    if (!targetIds || targetIds.length === 0 || targetIds.includes('all')) return '[Todos]';
    const names = targetIds.map(id => {
        if (id === state.myPeerId) return 'Você';
        const p = state.knownPlayers.find(kp => kp.id === id);
        return p ? p.name : 'Desconhecido';
    });
    return `[${names.join(', ')}]`;
}

export function setCheckboxes(targetIds) {
    const allInputs = document.querySelectorAll('.recipient-checkbox');
    const allOption = Array.from(allInputs).find(i => i.value === 'all');
    allInputs.forEach(input => {
        if (targetIds.includes('all')) input.checked = true;
        else input.checked = targetIds.includes(input.value);
    });
    if (!targetIds.includes('all') && allOption) allOption.checked = false;
}

export function initiateReply(mode, msgData) {
    state.replyingTo = {
        id: msgData.id,
        sender: msgData.sender,
        text: msgData.content
    };
    dom.replyTargetName.innerText = t('chat.replyingToSender', { sender: msgData.sender });
    dom.replyTargetMsg.innerText = msgData.content;
    dom.replyContextBar.classList.remove('hidden');

    if (mode === 'sender') {
        setCheckboxes([msgData.senderId]);
    } else if (mode === 'group') {
        let newTargets = [];
        if (msgData.targets.includes('all')) newTargets = ['all'];
        else {
            newTargets = msgData.targets.filter(id => id !== state.myPeerId);
            if (!newTargets.includes(msgData.senderId)) newTargets.push(msgData.senderId);
        }
        setCheckboxes(newTargets);
    }
    dom.chatInput.focus();
}

export function cancelReply() {
    state.replyingTo = null;
    dom.replyContextBar.classList.add('hidden');
}
