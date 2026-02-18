import { App } from '../appState.js';
import { t } from '../i18n.js';
import { getFormattedTimestamp } from '../utils.js';
import { scrollToBottom } from '../ui/scroll.js';
import { resolveTargetNames } from '../ui/recipients.js';

const { dom, state } = App;

export function generateImageHTML(url, isUpload) {
    const downloadAttr = isUpload ? 'download="imagem.png"' : 'target="_blank"';
    const downloadTitle = isUpload ? 'Baixar Imagem' : 'Abrir Original';

    return `
    <div class="image-wrapper relative group mt-2">
        <div class="image-actions absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <a href="${url}" ${downloadAttr} class="bg-black/60 text-white p-1 rounded hover:bg-black/80 flex items-center justify-center" title="${downloadTitle}" onclick="event.stopPropagation()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
            <button class="bg-black/60 text-white p-1 rounded hover:bg-black/80 flex items-center justify-center" onclick="event.stopPropagation(); this.closest('.image-wrapper').classList.add('collapsed')" title="Ocultar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
        </div>

        <div class="image-content cursor-pointer" onclick="this.closest('.image-wrapper').classList.toggle('collapsed')" title="Clique para ocultar/exibir">
            <img src="${url}" class="max-w-full max-h-64 rounded border border-zinc-700/50 hover:opacity-90 transition-opacity" loading="lazy" alt="Imagem">
        </div>

        <div class="collapsed-placeholder hidden text-xs text-zinc-500 text-center py-2 border border-dashed border-zinc-700 rounded cursor-pointer hover:bg-zinc-800 hover:text-zinc-300 transition-colors" onclick="this.parentElement.classList.remove('collapsed')">
            Imagem Oculta (Clique para ver)
        </div>
    </div>`;
}

export function renderChatMessageInto(div, msgData) {
    state.messageStore[msgData.id] = msgData;

    const sender = msgData.sender;
    const isMe = msgData.senderId === state.myPeerId;
    const isWhisper = msgData.targets && !msgData.targets.includes('all');
    const hideRecipients = msgData.hideRecipients;
    const replyTo = msgData.replyTo;
    const formattedTime = getFormattedTimestamp(msgData.timestamp);

    let contentHtml = '';

    if (msgData.type === 'image') {
        contentHtml = generateImageHTML(msgData.content, true);
    } else {
        const text = msgData.content;
        let hasImage = false;
        const processedText = text.replace(
            /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|svg)[^\s]*)/ig,
            (url) => {
                hasImage = true;
                return generateImageHTML(url, false);
            }
        );

        if (hasImage) {
            contentHtml = `<span class="text-zinc-200 block mt-1 break-words message-content-text">${isWhisper ? `<span class="text-xs opacity-70">(${t('dice.whisper')})</span> ` : ''}${processedText}</span>`;
        } else {
            contentHtml = `<span class="text-zinc-200 block mt-1 break-words message-content-text">${isWhisper ? `<span class="text-xs opacity-70">(${t('dice.whisper')})</span> ` : ''}${text}</span>`;
        }
    }

    let recipientsText = '';
    if (!hideRecipients) {
        recipientsText = resolveTargetNames(msgData.targets);
    } else if (isMe) {
        recipientsText = resolveTargetNames(msgData.targets) + ` (${t('chat.hiddenRecipients')})`;
    }

    div.id = msgData.id;
    div.className = 'message-container relative group mb-2';

    const bgClass = isMe ? 'bg-amber-900/20 border-amber-800/50' : 'bg-zinc-800/50 border-zinc-700/50';
    const alignClass = isMe ? 'ml-auto' : '';
    const recipientHtml = recipientsText ? `<span class="text-xs text-zinc-400 ml-1 font-normal">${recipientsText}</span>` : '';

    let quoteHtml = '';
    if (replyTo) {
        const replyText = replyTo.text.startsWith('data:image') ? t('chat.replyToImageLabel') : replyTo.text;
        quoteHtml = `
        <div class="mb-1 pl-2 border-l-2 border-zinc-600 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onclick="event.stopPropagation(); window.scrollToMessage('${replyTo.id}')">
            <div class="text-[10px] text-amber-500 font-bold">${t('dice.repliedTo', { sender: replyTo.sender })}</div>
            <div class="text-[10px] text-zinc-400 truncate">${replyText}</div>
        </div>`;
    }

    const replySenderBtn = `<button class="hover:text-amber-400 p-1" title="${t('chat.replyPrivate')}" onclick='event.stopPropagation(); window.initiateReply("sender", ${JSON.stringify(msgData)})'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg></button>`;
    const replyGroupBtn = !hideRecipients ? `<button class="hover:text-emerald-400 p-1 ml-1" title="${t('chat.replyAll')}" onclick='event.stopPropagation(); window.initiateReply("group", ${JSON.stringify(msgData)})'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></button>` : '';

    let deleteBtn = '';
    if (isMe || state.isHost) {
        deleteBtn = `<button class="hover:text-red-500 p-1 ml-1" title="${t('chat.deleteMessage')}" onclick='event.stopPropagation(); window.softDeleteMessage("${msgData.id}", "${msgData.senderId}")'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>`;
    }

    const actionsHtml = `<div class="message-actions absolute top-1 right-2 flex text-zinc-500 bg-zinc-900/50 rounded backdrop-blur-sm transition-opacity">${replySenderBtn}${replyGroupBtn}${deleteBtn}</div>`;

    div.innerHTML = `
        <div class="message-bubble p-2 rounded-lg border max-w-[85%] ${alignClass} ${bgClass} relative cursor-pointer" onclick="this.classList.toggle('show-actions')">
            ${actionsHtml}
            <span class="message-timestamp select-none">${formattedTime}</span>
            ${quoteHtml}
            <span class="font-bold ${isWhisper ? 'text-indigo-400' : 'text-amber-500'} text-sm block flex items-center gap-1">
                ${sender}${recipientHtml} 
            </span>
            ${contentHtml}
        </div>`;
}

export function renderDiceMessageInto(div, msgData) {
    state.messageStore[msgData.id] = msgData;

    const sender = msgData.sender;
    const dice = msgData.dice;
    const result = msgData.result;
    const isMe = msgData.senderId === state.myPeerId;
    const rollMode = msgData.rollMode;
    const formattedTime = getFormattedTimestamp(msgData.timestamp);

    div.id = msgData.id;
    div.className = 'message-container relative group mb-2';

    const isMasterRoll = sender.includes('★');
    let borderClass = isMasterRoll ? 'border-red-900/60 bg-red-900/10' : 'border-amber-700/30 bg-amber-900/10';

    if (rollMode === 'blind') borderClass = 'border-purple-900/60 bg-purple-900/10';
    else if (rollMode === 'gm' || rollMode === 'self') borderClass = 'border-zinc-700/50 bg-zinc-800/30';

    let icon = '';
    if (rollMode === 'blind') icon = `<span title="${t('dice.blindTitle')}">👁️‍🗨️</span> `;
    if (rollMode === 'gm') icon = `<span title="${t('dice.gmTitle')}">🛡️</span> `;
    if (rollMode === 'self') icon = `<span title="${t('dice.selfTitle')}">👤</span> `;
    if (rollMode === 'group') icon = `<span title="${t('dice.groupTitle')}">👥</span> `;

    const isComplex = typeof result === 'string' && result.includes('<div');

    let deleteBtn = '';
    if (isMe || state.isHost) {
        deleteBtn = `<div class="message-actions absolute top-1 right-2 flex text-zinc-500 bg-zinc-900/50 rounded backdrop-blur-sm transition-opacity"><button class="hover:text-red-500 p-1" title="${t('chat.deleteRoll')}" onclick='event.stopPropagation(); window.softDeleteMessage("${msgData.id}", "${msgData.senderId}")'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></div>`;
    }

    div.innerHTML = `
        <div class="message-bubble ${borderClass} p-2 rounded-lg border flex items-center justify-between cursor-pointer" onclick="this.parentElement.classList.toggle('show-actions')">
            ${deleteBtn}
            <span class="message-timestamp select-none">${formattedTime}</span>
            <div class="${isComplex ? 'w-full' : ''}">
                <span class="font-bold ${isMasterRoll ? 'text-red-400' : 'text-amber-600'} text-xs uppercase tracking-tighter block mb-1">
                    ${icon}${sender}
                    ${t('dice.rollVerb')} ${dice}:
                </span>
                ${isComplex ? result : `<div class="text-xl font-bold ${isMasterRoll ? 'text-red-500' : 'text-amber-400'} fantasy-font text-right">${result}</div>`}
            </div>
        </div>`;
}

export function addChatMessage(msgData) {
    const div = document.createElement('div');
    renderChatMessageInto(div, msgData);
    dom.chatMessages.appendChild(div);
    scrollToBottom();
}

export function addDiceMessage(msgData) {
    const div = document.createElement('div');
    renderDiceMessageInto(div, msgData);
    dom.chatMessages.appendChild(div);
    scrollToBottom();
}
