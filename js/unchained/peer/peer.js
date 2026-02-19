import { App } from '../appState.js';
import { t } from '../i18n.js';
import { generateProfileId, safeJsonParse, downloadJson } from '../utils.js';
import { normalizeSymbol } from '../utils.js';
import { addChatMessage, addDiceMessage } from '../chat/render.js';
import { applySoftDeleteUI, applyUndoDeleteUI, applyHardDeleteUI } from '../chat/delete.js';
import { addSystemMessage, scrollToBottom } from '../ui/scroll.js';
import { updateRecipientsUI } from '../ui/recipients.js';
import { ensureIdentityDefaults, saveIdentityToStorage, getMyBaseName, getMySymbol } from '../identity.js';

const { dom, state, constants } = App;

function setHostMode(flag) {
    state.isHost = !!flag;
    if (dom.hostChatControls) {
        if (state.isHost) dom.hostChatControls.classList.remove('hidden');
        else dom.hostChatControls.classList.add('hidden');
    }
}

function loadHostProfilesFromStorage() {
    const raw = localStorage.getItem(constants.HOST_PROFILES_STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    state.hostPlayerProfiles = Array.isArray(parsed) ? parsed : [];
}

function saveHostProfilesToStorage() {
    localStorage.setItem(constants.HOST_PROFILES_STORAGE_KEY, JSON.stringify(state.hostPlayerProfiles));
}

function loadHostChatHistoryFromStorage() {
    const raw = localStorage.getItem(constants.HOST_CHAT_STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    state.hostChatHistory = Array.isArray(parsed) ? parsed : [];
}

function saveHostChatHistoryToStorage() {
    localStorage.setItem(constants.HOST_CHAT_STORAGE_KEY, JSON.stringify(state.hostChatHistory));
}

function clearChatUI() {
    dom.chatMessages.innerHTML = '';
}

function restoreChatFromHostHistory() {
    if (!state.isHost) return;
    loadHostChatHistoryFromStorage();
    clearChatUI();

    state.isRestoringHistory = true;
    try {
        state.hostChatHistory.forEach((evt) => {
            if (!evt || typeof evt !== 'object') return;
            if (evt.type === 'chat' || evt.type === 'image') addChatMessage(evt);
            else if (evt.type === 'dice') addDiceMessage(evt);
            else if (evt.type === 'soft-delete') applySoftDeleteUI(evt);
            else if (evt.type === 'undo-delete') applyUndoDeleteUI(evt);
            else if (evt.type === 'hard-delete') applyHardDeleteUI(evt);
        });
    } finally {
        state.isRestoringHistory = false;
    }

    setTimeout(() => scrollToBottom(true), 50);
}

function persistHostChatEvent(evt) {
    if (!state.isHost || state.isRestoringHistory) return;
    if (!evt || typeof evt !== 'object') return;
    const allowed = ['chat', 'image', 'dice', 'soft-delete', 'undo-delete', 'hard-delete'];
    if (!allowed.includes(evt.type)) return;
    state.hostChatHistory.push(evt);
    saveHostChatHistoryToStorage();
}

function bindHostChatButtons() {
    if (!dom.btnExportChat || !dom.btnImportChat || !dom.btnClearChat || !dom.chatImportFile) return;

    dom.btnExportChat.onclick = () => {
        if (!state.isHost) return;
        loadHostChatHistoryFromStorage();
        loadHostProfilesFromStorage();
        downloadJson(`rpg-direct-chat-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`, {
            version: 1,
            exportedAt: Date.now(),
            chatHistory: state.hostChatHistory,
            playerProfiles: state.hostPlayerProfiles
        });
    };

    dom.btnImportChat.onclick = () => {
        if (!state.isHost) return;
        dom.chatImportFile.click();
    };

    dom.chatImportFile.onchange = async () => {
        if (!state.isHost) return;
        const file = dom.chatImportFile.files && dom.chatImportFile.files[0];
        dom.chatImportFile.value = '';
        if (!file) return;

        const text = await file.text();
        const parsed = safeJsonParse(text);
        if (!parsed || typeof parsed !== 'object') {
            addSystemMessage(t('system.invalidFile'));
            return;
        }

        const importedHistory = Array.isArray(parsed.chatHistory) ? parsed.chatHistory : (Array.isArray(parsed) ? parsed : null);
        const importedProfiles = Array.isArray(parsed.playerProfiles) ? parsed.playerProfiles : [];

        if (!importedHistory) {
            addSystemMessage(t('system.invalidFile'));
            return;
        }

        if (!confirm(t('system.importChatConfirm'))) return;

        state.hostChatHistory = importedHistory;
        saveHostChatHistoryToStorage();

        state.hostPlayerProfiles = importedProfiles;
        saveHostProfilesToStorage();

        restoreChatFromHostHistory();
        addSystemMessage(t('system.chatImported'));
    };

    dom.btnClearChat.onclick = () => {
        if (!state.isHost) return;
        if (!confirm(t('system.clearChatConfirm'))) return;
        state.hostChatHistory = [];
        saveHostChatHistoryToStorage();
        state.messageStore = {};
        clearChatUI();
        addSystemMessage(t('system.chatCleared'));
    };
}

function getPlayerDisplayNameFromData(data) {
    const n = (data && typeof data.name === 'string' && data.name.trim()) ? data.name.trim() : t('user.anonymous');
    const sym = normalizeSymbol(data && data.symbol);
    const prefix = sym ? `${sym} ` : '';
    return `${prefix}${n}`;
}

function upsertKnownPlayer(id, data) {
    const idx = state.knownPlayers.findIndex(p => p.id === id);
    const name = getPlayerDisplayNameFromData(data);
    if (idx >= 0) {
        state.knownPlayers[idx].name = name;
        state.knownPlayers[idx].baseName = (data && data.name) ? data.name : state.knownPlayers[idx].baseName;
        state.knownPlayers[idx].symbol = (data && data.symbol) ? data.symbol : state.knownPlayers[idx].symbol;
        state.knownPlayers[idx].profileId = (data && data.profileId) ? data.profileId : state.knownPlayers[idx].profileId;
    } else {
        state.knownPlayers.push({
            id,
            name,
            baseName: data && data.name ? data.name : null,
            symbol: data && data.symbol ? data.symbol : null,
            profileId: data && data.profileId ? data.profileId : null
        });
    }
}

function handlePlayerJoin(id, name) {
    const idx = state.knownPlayers.findIndex(p => p.id === id);
    if (idx >= 0) state.knownPlayers[idx].name = name;
    else state.knownPlayers.push({ id: id, name: name });
    addSystemMessage(t('system.playerJoined', { name }));
    broadcastPlayerList();
    updateRecipientsUI();
}

function handlePlayerLeave(id) {
    const p = state.knownPlayers.find(pl => pl.id === id);
    if (p) addSystemMessage(t('system.playerLeft', { name: p.name }));
    state.knownPlayers = state.knownPlayers.filter(pl => pl.id !== id);
    state.connections = state.connections.filter(c => c.peer !== id);
    broadcastPlayerList();
    updateRecipientsUI();
}

function broadcastPlayerList() {
    const fullList = [{ id: state.myPeerId, name: getMyBaseName(), symbol: getMySymbol(), isHost: true }, ...state.knownPlayers.map(p => ({ id: p.id, name: p.baseName || p.name, symbol: p.symbol || null, profileId: p.profileId || null }))];
    state.connections.forEach(c => { if (c.open) c.send({ type: 'player-list', list: fullList }); });
}

function handleData(data) {
    if (data.type === 'profiles') {
        if (state.isHost) return;
        if (state.hasSentJoin) return;

        const profiles = Array.isArray(data.profiles) ? data.profiles : [];
        const currentName = getMyBaseName();

        let selectedProfile = profiles.find(p => p && typeof p.baseName === 'string' && p.baseName.trim().toLowerCase() === currentName.trim().toLowerCase()) || null;
        let profileId = selectedProfile ? selectedProfile.profileId : (localStorage.getItem(constants.LOCAL_PROFILE_ID_KEY) || null);

        if (!selectedProfile) {
            if (profiles.length > 0) {
                const selectable = profiles.filter(p => p && typeof p.baseName === 'string' && p.baseName.trim() && typeof p.profileId === 'string' && p.profileId.trim());
                const list = selectable.map((p, i) => `${i + 1}) ${p.baseName}`).join('\n');

                const choice = prompt(`Seu nick não está nos jogadores salvos.\n\nEscolha um existente digitando o número, ou digite um novo nome:\n\n${list}`, currentName);
                const raw = (choice || '').trim();
                const asNumber = parseInt(raw, 10);

                if (!Number.isNaN(asNumber) && asNumber >= 1 && asNumber <= selectable.length) {
                    selectedProfile = selectable[asNumber - 1];
                    if (selectedProfile && selectedProfile.profileId) {
                        profileId = selectedProfile.profileId;
                        if (selectedProfile.baseName) dom.nameInput.value = selectedProfile.baseName;
                        if (selectedProfile.symbol) dom.symbolInput.value = selectedProfile.symbol;
                    }
                } else if (raw) {
                    dom.nameInput.value = raw;
                }
            }
        }

        if (!profileId) profileId = generateProfileId();
        localStorage.setItem(constants.LOCAL_PROFILE_ID_KEY, profileId);
        ensureIdentityDefaults();
        saveIdentityToStorage();

        if (state.conn && state.conn.open) {
            state.conn.send({ type: 'join', profileId, name: getMyBaseName(), symbol: getMySymbol() });
            state.hasSentJoin = true;
        }
        return;
    }

    if (data.type === 'player-list') {
        state.knownPlayers = [];
        data.list.filter(p => p.id !== state.myPeerId).forEach(p => upsertKnownPlayer(p.id, p));
        updateRecipientsUI();
        return;
    }

    if (data && data.id && (data.type === 'chat' || data.type === 'image' || data.type === 'dice')) {
        state.messageStore[data.id] = data;
    }

    const amITarget = !data.targets || data.targets.includes('all') || data.targets.includes(state.myPeerId) || data.senderId === state.myPeerId;

    if (state.isHost) {
        if (data.targets && !data.targets.includes('all')) {
            const targetIds = data.targets;
            state.connections.forEach(c => { if (targetIds.includes(c.peer) && c.open) c.send(data); });
        } else {
            state.connections.forEach(c => { if (c.peer !== data.senderId && c.open) c.send(data); });
        }
    }

    persistHostChatEvent(data);

    const isDeleteEvent = data.type === 'soft-delete' || data.type === 'undo-delete' || data.type === 'hard-delete';

    if (amITarget || isDeleteEvent) {
        if (data.type === 'chat' || data.type === 'image') {
            addChatMessage(data);
        } else if (data.type === 'dice') {
            let displayResult = data.result;
            let displaySender = data.sender;

            if (data.rollMode === 'blind' && data.senderId === state.myPeerId) displayResult = '?? (Cegas)';
            if (data.rollMode === 'blind') displaySender += ' (Cegas)';
            else if (data.rollMode === 'gm' || data.rollMode === 'self') displaySender += ' (Privado)';

            const diceData = { ...data, sender: displaySender, result: displayResult };
            addDiceMessage(diceData);
        } else if (data.type === 'soft-delete') {
            applySoftDeleteUI(data);
        } else if (data.type === 'undo-delete') {
            applyUndoDeleteUI(data);
        } else if (data.type === 'hard-delete') {
            applyHardDeleteUI(data);
        }
    }

    setTimeout(() => scrollToBottom(false), 50);
}

export function initPeer(forceNew = false) {
    state.handleData = handleData;

    if (state.peer) state.peer.destroy();

    let savedId = localStorage.getItem('rpg_p2p_host_id');
    if (forceNew) savedId = null;

    state.peer = savedId ? new Peer(savedId) : new Peer();

    state.peer.on('open', (id) => {
        state.myPeerId = id;
        localStorage.setItem('rpg_p2p_host_id', id);

        dom.peerIdDisplay.innerText = id;
        dom.myIdBox.classList.remove('hidden');
        dom.statusDot.classList.replace('bg-red-500', 'bg-blue-500');
        dom.statusDot.title = t('status.waitingConnection');

        setHostMode(!state.isJoiningAsPlayer);
        if (state.isHost) {
            loadHostProfilesFromStorage();
            restoreChatFromHostHistory();
        }

        if (forceNew) addSystemMessage(t('system.newIdGenerated'));
        else addSystemMessage(t('system.idRecovered'));

        updateRecipientsUI();
    });

    state.peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            console.warn('ID salvo indisponível. Gerando novo...');
            initPeer(true);
        } else {
            console.error('PeerJS Error:', err);
            addSystemMessage(t('system.connectionError', { type: err.type }));
        }
    });

    state.peer.on('connection', (newConn) => {
        setHostMode(true);
        dom.statusDot.classList.replace('bg-blue-500', 'bg-green-500');
        dom.statusDot.title = t('status.hosting');

        newConn.on('open', () => {
            state.connections.push(newConn);
            loadHostProfilesFromStorage();
            newConn.send({ type: 'profiles', profiles: state.hostPlayerProfiles });
            broadcastPlayerList();
        });

        newConn.on('data', (data) => {
            if (data.type === 'join') {
                if (data && data.profileId) {
                    loadHostProfilesFromStorage();
                    const existing = state.hostPlayerProfiles.find(p => p && p.profileId === data.profileId);
                    if (existing) {
                        if (typeof data.name === 'string' && data.name.trim()) existing.baseName = data.name.trim();
                        if (typeof data.symbol === 'string' && data.symbol.trim()) existing.symbol = data.symbol.trim();
                    } else {
                        state.hostPlayerProfiles.push({
                            profileId: data.profileId,
                            baseName: typeof data.name === 'string' ? data.name.trim() : null,
                            symbol: typeof data.symbol === 'string' ? data.symbol.trim() : null
                        });
                    }
                    saveHostProfilesToStorage();
                }

                upsertKnownPlayer(newConn.peer, data);
                handlePlayerJoin(newConn.peer, getPlayerDisplayNameFromData(data));
                newConn.send({ type: 'profiles', profiles: state.hostPlayerProfiles });
            } else if (data.type === 'request-profiles') {
                loadHostProfilesFromStorage();
                newConn.send({ type: 'profiles', profiles: state.hostPlayerProfiles });
            } else {
                handleData(data);
            }
        });

        newConn.on('close', () => handlePlayerLeave(newConn.peer));
    });

    dom.btnResetId.onclick = () => {
        if (confirm(t('system.resetIdConfirm'))) initPeer(true);
    };

    dom.peerIdDisplay.onclick = () => {
        const textToCopy = dom.peerIdDisplay.innerText;
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            if (document.execCommand('copy')) {
                addSystemMessage(t('system.idCopied'));
                const originalColor = dom.peerIdDisplay.style.color;
                dom.peerIdDisplay.style.color = '#4ade80';
                setTimeout(() => { dom.peerIdDisplay.style.color = originalColor; }, 1000);
            } else addSystemMessage(t('system.copyIdManually'));
        } catch (err) {
            addSystemMessage(t('system.copyError'));
        }
        document.body.removeChild(textArea);
    };

    dom.btnConnect.onclick = () => {
        const remoteId = dom.remoteIdInput.value.trim();
        if (!remoteId) return;

        state.isJoiningAsPlayer = true;
        setHostMode(false);

        localStorage.setItem('rpg_p2p_remote_id', remoteId);

        state.conn = state.peer.connect(remoteId);
        state.conn.on('open', () => {
            dom.statusDot.classList.replace('bg-blue-500', 'bg-green-500');
            dom.statusDot.title = t('status.connected');
            addSystemMessage(t('system.joinedTable'));
            document.getElementById('join-controls').classList.add('hidden');
            ensureIdentityDefaults();
            saveIdentityToStorage();

            state.hasSentJoin = false;
            state.conn.send({ type: 'request-profiles' });
        });

        state.conn.on('data', (data) => handleData(data));

        state.conn.on('close', () => {
            addSystemMessage(t('system.connectionLost'));
            dom.statusDot.classList.replace('bg-green-500', 'bg-red-500');
            state.knownPlayers = [];
            updateRecipientsUI();
        });
    };

    bindHostChatButtons();
}

export function bindIdentityChangeHandlers() {
    if (dom.nameInput) dom.nameInput.addEventListener('change', () => { ensureIdentityDefaults(); saveIdentityToStorage(); broadcastPlayerList(); updateRecipientsUI(); });
    if (dom.symbolInput) dom.symbolInput.addEventListener('change', () => { ensureIdentityDefaults(); saveIdentityToStorage(); broadcastPlayerList(); updateRecipientsUI(); });
    if (dom.symbolInput) dom.symbolInput.addEventListener('input', () => { ensureIdentityDefaults(); saveIdentityToStorage(); broadcastPlayerList(); updateRecipientsUI(); });
}
