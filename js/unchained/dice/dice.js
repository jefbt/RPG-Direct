import { App } from '../appState.js';
import { generateUUID } from '../utils.js';
import { getSelectedTargets } from '../ui/recipients.js';
import { getMyDisplayName } from '../identity.js';
import { addDiceMessage } from '../chat/render.js';

const { dom, state } = App;

export function updateDiceVisibility() {
    const dice = document.querySelectorAll('.standard-die');
    dice.forEach(d => {
        if (state.showStandardDice) d.classList.remove('hidden');
        else d.classList.add('hidden');
    });

    if (state.showStandardDice) {
        dom.toggleDiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        dom.toggleDiceBtn.classList.replace('text-zinc-600', 'text-zinc-500');
    } else {
        dom.toggleDiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        dom.toggleDiceBtn.classList.replace('text-zinc-500', 'text-zinc-600');
    }
}

export function bindDiceToggle() {
    const savedDiceState = localStorage.getItem('rpg_p2p_show_dice');
    if (savedDiceState !== null) {
        state.showStandardDice = savedDiceState === 'true';
    }

    dom.toggleDiceBtn.onclick = () => {
        state.showStandardDice = !state.showStandardDice;
        localStorage.setItem('rpg_p2p_show_dice', state.showStandardDice);
        updateDiceVisibility();
    };
}

export function rollDice(e, sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const myName = getMyDisplayName();

    let mode = document.querySelector('input[name="roll-mode"]:checked').value;

    if (e && e.ctrlKey) mode = 'gm';
    else if (e && e.shiftKey) mode = 'blind';

    let targets = ['all'];

    if (mode === 'open') {
        targets = ['all'];
    } else if (mode === 'gm') {
        if (state.isHost) targets = [state.myPeerId];
        else if (state.conn) targets = [state.conn.peer, state.myPeerId];
        else targets = [state.myPeerId];
    } else if (mode === 'blind') {
        if (state.isHost) targets = [state.myPeerId];
        else if (state.conn) targets = [state.conn.peer];
        else targets = [state.myPeerId];
    } else if (mode === 'group') {
        targets = getSelectedTargets();
    } else if (mode === 'self') {
        targets = [state.myPeerId];
    }

    const payload = {
        id: generateUUID(),
        type: 'dice',
        sender: myName,
        senderId: state.myPeerId,
        dice: `D${sides}`,
        result: result,
        targets: targets,
        rollMode: mode,
        timestamp: Date.now()
    };

    state.messageStore[payload.id] = payload;

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
