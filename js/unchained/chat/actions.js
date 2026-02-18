import { App } from '../appState.js';
import { generateUUID } from '../utils.js';
import { addChatMessage } from './render.js';
import { cancelReply } from '../ui/recipients.js';
import { addSystemMessage, scrollToBottom } from '../ui/scroll.js';
import { t } from '../i18n.js';
import { getSelectedTargets } from '../ui/recipients.js';
import { getMyDisplayName } from '../identity.js';

const { dom, state } = App;

export function sendChat() {
    const msg = dom.chatInput.value.trim();
    if (!msg) return;

    const myName = getMyDisplayName();
    const targets = getSelectedTargets();
    const isGroupMode = dom.groupToggle.checked;
    const msgId = generateUUID();

    const payload = {
        id: msgId,
        type: 'chat',
        sender: myName,
        senderId: state.myPeerId,
        content: msg,
        targets: targets,
        hideRecipients: !isGroupMode,
        replyTo: state.replyingTo,
        timestamp: Date.now()
    };

    state.messageStore[payload.id] = payload;

    if (state.isHost && typeof state.handleData === 'function') {
        state.handleData(payload);
    } else if (state.conn && state.conn.open) {
        state.conn.send(payload);
        addChatMessage(payload);
    } else if (!state.conn && !state.isHost) {
        addChatMessage(payload);
    }

    dom.chatInput.value = '';
    cancelReply();
}

export function sendImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        const myName = getMyDisplayName();
        const targets = getSelectedTargets();
        const isGroupMode = dom.groupToggle.checked;
        const msgId = generateUUID();

        const payload = {
            id: msgId,
            type: 'image',
            sender: myName,
            senderId: state.myPeerId,
            content: base64,
            fileName: file.name || 'imagem.png',
            targets: targets,
            hideRecipients: !isGroupMode,
            replyTo: state.replyingTo,
            timestamp: Date.now()
        };

        state.messageStore[payload.id] = payload;

        if (state.isHost && typeof state.handleData === 'function') {
            state.handleData(payload);
        } else if (state.conn && state.conn.open) {
            state.conn.send(payload);
            addChatMessage(payload);
        } else if (!state.conn && !state.isHost) {
            addChatMessage(payload);
        }

        cancelReply();
    };
    reader.readAsDataURL(file);
}

export function bindChatInput() {
    dom.btnSend.onclick = sendChat;
    dom.chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendChat(); };

    dom.imageInput.onchange = function() {
        const file = this.files[0];
        if (file) sendImage(file);
        this.value = '';
    };

    dom.chatInput.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const index in items) {
            const item = items[index];
            if (item && item.kind === 'file' && item.type.includes('image/')) {
                const blob = item.getAsFile();
                sendImage(blob);
                e.preventDefault();
            }
        }
    });

    window.addEventListener('dragover', (e) => {
        e.preventDefault();
        dom.body.classList.add('drag-active');
    });

    window.addEventListener('dragleave', (e) => {
        if (e.relatedTarget === null || e.clientX === 0 || e.clientY === 0) {
            dom.body.classList.remove('drag-active');
        }
    });

    window.addEventListener('drop', (e) => {
        e.preventDefault();
        dom.body.classList.remove('drag-active');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                sendImage(file);
            } else {
                addSystemMessage(t('system.imagesOnly'));
            }
        }

        setTimeout(() => scrollToBottom(false), 50);
    });
}
