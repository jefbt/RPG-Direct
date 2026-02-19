import { App } from '../appState.js';
import { t } from '../i18n.js';
import { renderChatMessageInto, renderDiceMessageInto } from './render.js';

const { state } = App;

function getHostPeerId() {
    if (state.isHost) return state.myPeerId;
    return state.conn ? state.conn.peer : null;
}

function sendDeleteEvent(payload) {
    if (state.isHost && typeof state.handleData === 'function') {
        state.handleData(payload);
        return;
    }

    if (state.conn && state.conn.open) {
        state.conn.send(payload);
        return;
    }

    if (typeof state.handleData === 'function') state.handleData(payload);
}

export function softDeleteMessage(msgId, originalSenderId) {
    const originalPayload = state.messageStore[msgId] || null;

    const payload = {
        type: 'soft-delete',
        id: msgId,
        actorId: state.myPeerId,
        originalSenderId: originalSenderId,
        originalPayload: originalPayload
    };

    applySoftDeleteUI(payload);
    sendDeleteEvent(payload);
}

export function undoDeleteMessage(msgId) {
    const originalPayload = state.messageStore[msgId] || null;

    const payload = {
        type: 'undo-delete',
        id: msgId,
        actorId: state.myPeerId,
        originalSenderId: originalPayload ? originalPayload.senderId : null,
        originalPayload: originalPayload
    };

    applyUndoDeleteUI(payload);
    sendDeleteEvent(payload);
}

export function hardDeleteMessage(msgId, originalSenderId) {
    const originalPayload = state.messageStore[msgId] || null;

    const payload = {
        type: 'hard-delete',
        id: msgId,
        actorId: state.myPeerId,
        originalSenderId: originalSenderId || (originalPayload ? originalPayload.senderId : null),
        originalPayload: originalPayload
    };

    applyHardDeleteUI(payload);
    sendDeleteEvent(payload);
}

function buildDeletedPlaceholderInnerHTML(msgId, actorId, originalSenderId, isFinal) {
    const actorIsMe = actorId === state.myPeerId;
    const canAct = (actorIsMe || state.isHost);

    const undoBtn = (!isFinal && canAct)
        ? `<button class="hover:text-emerald-400 p-1" title="${t('dice.undo')}" onclick='event.stopPropagation(); window.undoDeleteMessage("${msgId}")'>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7v6h6"></path>
                <path d="M3 13a9 9 0 1 0 3-7"></path>
            </svg>
        </button>`
        : '';

    const deleteBtn = (!isFinal && canAct)
        ? `<button class="hover:text-red-500 p-1 ml-1" title="${t('dice.hardDelete')}" onclick='event.stopPropagation(); window.hardDeleteMessage("${msgId}", "${originalSenderId || ''}")'>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>`
        : '';

    const actionsHtml = (undoBtn || deleteBtn)
        ? `<div class="message-actions absolute top-1 right-2 flex text-zinc-500 bg-zinc-900/50 rounded backdrop-blur-sm transition-opacity">${undoBtn}${deleteBtn}</div>`
        : '';

    const label = isFinal ? t('dice.deleted') : t('dice.messageDeleted');

    return `
        <div class="message-bubble p-2 rounded-lg border max-w-[85%] bg-zinc-900/40 border-red-900/40 relative cursor-pointer deleted-placeholder-bubble" onclick="this.classList.toggle('show-actions')">
            ${actionsHtml}
            <span class="font-bold text-red-300 text-xs uppercase tracking-tighter block mb-1">${label}</span>
            <span class="text-zinc-500 text-xs block">${t('dice.undoAvailable')}</span>
        </div>`;
}

export function applySoftDeleteUI(data) {
    const msgId = data.id;
    const el = document.getElementById(msgId);
    if (!el) return;

    if (data.originalPayload && data.originalPayload.id) {
        state.messageStore[data.originalPayload.id] = data.originalPayload;
    }

    el.classList.add('deleted-placeholder');
    el.innerHTML = buildDeletedPlaceholderInnerHTML(msgId, data.actorId, data.originalSenderId, false);
}

export function applyUndoDeleteUI(data) {
    const msgId = data.id;
    const el = document.getElementById(msgId);
    if (!el) return;

    const originalPayload = data.originalPayload || state.messageStore[msgId];
    if (!originalPayload) return;

    state.messageStore[msgId] = originalPayload;
    el.classList.remove('deleted-placeholder');

    if (originalPayload.type === 'dice') {
        renderDiceMessageInto(el, originalPayload);
    } else {
        renderChatMessageInto(el, originalPayload);
    }
}

export function applyHardDeleteUI(data) {
    const msgId = data.id;
    const el = document.getElementById(msgId);
    if (!el) return;

    const hostId = getHostPeerId();
    const actorIsHost = data.actorId && hostId && data.actorId === hostId;

    if (actorIsHost) {
        el.remove();
        return;
    }

    if (state.isHost) {
        el.classList.add('deleted-placeholder');
        el.innerHTML = buildDeletedPlaceholderInnerHTML(msgId, data.actorId, data.originalSenderId, true);
    } else {
        el.remove();
    }
}
