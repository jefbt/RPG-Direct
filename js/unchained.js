const APP_VERSION = '0.22.0';
window.APP_VERSION = APP_VERSION;

const peerIdDisplay = document.getElementById('peer-id');
const myIdBox = document.getElementById('my-id-display');
const remoteIdInput = document.getElementById('remote-id');
const btnConnect = document.getElementById('btn-connect');
const chatInput = document.getElementById('chat-input');
const btnSend = document.getElementById('btn-send');
const chatMessages = document.getElementById('chat-messages');
const statusDot = document.getElementById('status-dot');
const nameInput = document.getElementById('player-name');
const symbolInput = document.getElementById('player-symbol');
const languageSelect = document.getElementById('language-select');
const recipientsContainer = document.getElementById('recipients-container');
const groupToggle = document.getElementById('group-toggle');
const replyContextBar = document.getElementById('reply-context-bar');
const replyTargetName = document.getElementById('reply-target-name');
const replyTargetMsg = document.getElementById('reply-target-msg');
const imageInput = document.getElementById('image-input');
const btnResetId = document.getElementById('btn-reset-id');
const scrollDownBtn = document.getElementById('scroll-down-btn');
const toggleDiceBtn = document.getElementById('toggle-dice-btn'); // Novo botão

const hostChatControls = document.getElementById('host-chat-controls');
const btnExportChat = document.getElementById('btn-export-chat');
const btnImportChat = document.getElementById('btn-import-chat');
const btnClearChat = document.getElementById('btn-clear-chat');
const chatImportFile = document.getElementById('chat-import-file');

// Macro Elements
const macroEditor = document.getElementById('macro-editor');
const macrosContainer = document.getElementById('macros-container');
const zoneHighest = document.getElementById('zone-highest');
const zoneLowest = document.getElementById('zone-lowest');
const zoneSum = document.getElementById('zone-sum');

let peer = null;
let myPeerId = null;
let connections = [];
let conn = null;
let isHost = false;

let isJoiningAsPlayer = false;

let knownPlayers = [];
let replyingTo = null;

let messageStore = {}; // msgId -> original payload (chat/image/dice)

const HOST_CHAT_STORAGE_KEY = 'rpg_p2p_host_chat_history_v1';
const HOST_PROFILES_STORAGE_KEY = 'rpg_p2p_host_player_profiles_v1';
const LOCAL_PROFILE_ID_KEY = 'rpg_p2p_profile_id_v1';

const LANGUAGE_STORAGE_KEY = 'rpg_p2p_language_v1';

const I18N = {
    en: {
        ui: {
            playerSymbolTitle: 'Your symbol',
            random: 'Random',
            yourNick: 'Your Nick',
            clickToCopy: 'Click to copy',
            generateNewId: 'Generate New ID',
            gmId: 'GM ID',
            join: 'Join',
            exportChat: 'Export Chat',
            importChat: 'Import Chat',
            clearChat: 'Clear Chat',
            welcomeHtml: 'Welcome to RPG Direct. <br>Set your nick above. <br>GMs: share your ID. Players: paste the ID and join.',
            scrollToBottom: 'Go to bottom',
            macroEditor: 'Macro Editor',
            macroName: 'Name (e.g.: VNT)',
            clickDieToAdd: 'Click a die to add it to the selected area',
            zoneHighest: 'Highest (roll X, keep highest)',
            zoneLowest: 'Lowest (roll X, keep lowest)',
            addToSum: '+ Add to Sum',
            finalSum: 'Final Sum (Result)',
            addMod: 'Add Mod',
            import: 'Import',
            export: 'Export',
            delete: 'Delete',
            cancel: 'Cancel',
            save: 'Save',
            toggleDice: 'Show/Hide Standard Dice',
            createMacro: 'Create Macro',
            chatTo: 'Chat To:',
            showRecipientsTitle: 'Show recipients in the message',
            visibleNames: 'Visible Names',
            replyingTo: 'Replying to...',
            sendImage: 'Send Image',
            typeMessage: 'Type a message... (Paste images here)',
            send: 'Send',
            diceHelp: 'Click: Roll | Ctrl+Click: To GM | Shift+Click: Blind',
            rollModeOpen: 'Open',
            rollModeGm: 'GM',
            rollModeBlind: 'Blind',
            rollModeGroup: 'Group',
            rollModeSelf: 'Self'
        },
        system: {
            invalidFile: 'Invalid file.',
            chatImported: 'Chat imported.',
            chatCleared: 'Chat cleared.',
            clearChatConfirm: 'This will delete the host saved chat history. Continue?',
            importChatConfirm: 'Importing will replace the host saved chat. Continue?',
            imagesOnly: 'Only image files are supported.',
            newIdGenerated: 'New ID generated successfully.',
            idRecovered: 'ID recovered. Share it to host.',
            connectionError: 'Connection error: {type}',
            idCopied: 'ID copied!',
            copyIdManually: 'Please copy the ID manually.',
            copyError: 'Error while copying.',
            joinedTable: 'Joined the GM table!',
            connectionLost: 'Connection lost.',
            originalNotFound: 'Original message not found.',
            playerJoined: '{name} joined the table.',
            playerLeft: '{name} disconnected.',
            resetIdConfirm: 'Generating a new ID will disconnect all current players if you are the GM. Continue?'
        },
        status: {
            waitingConnection: 'Waiting for connection',
            hosting: 'Hosting',
            connected: 'Connected'
        },
        chat: {
            hiddenRecipients: 'Hidden',
            replyingToSender: 'Replying to {sender}:',
            replyToImageLabel: '[Image]',
            replyPrivate: 'Reply privately',
            replyAll: 'Reply to all',
            deleteMessage: 'Delete message',
            deleteRoll: 'Delete roll',
            macroHoldToEdit: 'Hold to edit'
        },
        user: {
            anonymous: 'Anonymous',
            traveler: 'Traveler'
        },
        dice: {
            whisper: 'Whisper',
            repliedTo: 'Replied to {sender}:',
            rollVerb: 'rolls',
            deleted: 'DELETED',
            messageDeleted: 'MESSAGE DELETED',
            undoAvailable: '(undo available until hard delete)',
            undo: 'Undo',
            hardDelete: 'Hard Delete',
            blindTitle: 'Blind',
            gmTitle: 'To GM',
            selfTitle: 'Only Me',
            groupTitle: 'Group'
        }
    },
    'pt-BR': {
        ui: {
            playerSymbolTitle: 'Seu símbolo',
            random: 'Aleatório',
            yourNick: 'Seu Nick',
            clickToCopy: 'Clique para copiar',
            generateNewId: 'Gerar Novo ID',
            gmId: 'ID do Mestre',
            join: 'Entrar',
            exportChat: 'Exportar Chat',
            importChat: 'Importar Chat',
            clearChat: 'Limpar Chat',
            welcomeHtml: 'Bem-vindo ao RPG Direct. <br>Defina seu nick acima. <br>Mestres: Compartilhem seu ID. Jogadores: Colem o ID e entrem.',
            scrollToBottom: 'Ir para o final',
            macroEditor: 'Editor de Macro',
            macroName: 'Nome (ex: VNT)',
            clickDieToAdd: 'Clique num dado para adicionar à área selecionada',
            zoneHighest: 'Maior (Rola X, mantém maior)',
            zoneLowest: 'Menor (Rola X, mantém menor)',
            addToSum: '+ Adicionar à Soma',
            finalSum: 'Soma Final (Resultado)',
            addMod: 'Add Mod',
            import: 'Importar',
            export: 'Exportar',
            delete: 'Apagar',
            cancel: 'Cancelar',
            save: 'Salvar',
            toggleDice: 'Mostrar/Ocultar Dados Padrão',
            createMacro: 'Criar Macro',
            chatTo: 'Chat Para:',
            showRecipientsTitle: 'Mostrar destinatários na mensagem',
            visibleNames: 'Nomes Visíveis',
            replyingTo: 'Respondendo a...',
            sendImage: 'Enviar Imagem',
            typeMessage: 'Digite uma mensagem... (Cole imagens aqui)',
            send: 'Enviar',
            diceHelp: 'Clique: Rolar | Ctrl+Clique: Para Mestre | Shift+Clique: Às Cegas',
            rollModeOpen: 'Aberto',
            rollModeGm: 'Mestre',
            rollModeBlind: 'Às Cegas',
            rollModeGroup: 'Grupo',
            rollModeSelf: 'Eu'
        },
        system: {
            invalidFile: 'Arquivo inválido.',
            chatImported: 'Chat importado.',
            chatCleared: 'Chat limpo.',
            clearChatConfirm: 'Isso apagará o histórico de chat salvo no host. Continuar?',
            importChatConfirm: 'Importar substituirá o chat salvo do host. Continuar?',
            imagesOnly: 'Apenas arquivos de imagem são suportados.',
            newIdGenerated: 'Novo ID gerado com sucesso.',
            idRecovered: 'ID recuperado. Compartilhe para hospedar.',
            connectionError: 'Erro de conexão: {type}',
            idCopied: 'ID copiado!',
            copyIdManually: 'Copie o ID manualmente.',
            copyError: 'Erro ao copiar.',
            joinedTable: 'Conectado à mesa do Mestre!',
            connectionLost: 'Conexão perdida.',
            originalNotFound: 'Mensagem original não encontrada.',
            playerJoined: '{name} entrou na mesa.',
            playerLeft: '{name} desconectou.',
            resetIdConfirm: 'Gerar um novo ID desconectará todos os jogadores atuais se você for o mestre. Continuar?'
        },
        status: {
            waitingConnection: 'Aguardando conexão',
            hosting: 'Hospedando',
            connected: 'Conectado'
        },
        chat: {
            hiddenRecipients: 'Oculto',
            replyingToSender: 'Respondendo a {sender}:',
            replyToImageLabel: '[Imagem]',
            replyPrivate: 'Responder em particular',
            replyAll: 'Responder a todos',
            deleteMessage: 'Apagar Mensagem',
            deleteRoll: 'Apagar Rolagem',
            macroHoldToEdit: 'Segure para editar'
        },
        user: {
            anonymous: 'Anônimo',
            traveler: 'Viajante'
        },
        dice: {
            whisper: 'Sussurro',
            repliedTo: 'Respondeu {sender}:',
            rollVerb: 'rola',
            deleted: 'APAGADA',
            messageDeleted: 'MENSAGEM APAGADA',
            undoAvailable: '(undo disponível até apagar definitivo)',
            undo: 'Desfazer',
            hardDelete: 'Apagar Definitivo',
            blindTitle: 'Cegas',
            gmTitle: 'Para Mestre',
            selfTitle: 'Apenas Eu',
            groupTitle: 'Grupo'
        }
    },
    es: {
        ui: {
            playerSymbolTitle: 'Tu símbolo',
            random: 'Aleatorio',
            yourNick: 'Tu Nick',
            clickToCopy: 'Haz clic para copiar',
            generateNewId: 'Generar nuevo ID',
            gmId: 'ID del GM',
            join: 'Entrar',
            exportChat: 'Exportar chat',
            importChat: 'Importar chat',
            clearChat: 'Limpiar chat',
            welcomeHtml: 'Bienvenido a RPG Direct. <br>Define tu nick arriba. <br>GMs: compartan su ID. Jugadores: peguen el ID y entren.',
            scrollToBottom: 'Ir al final',
            macroEditor: 'Editor de macros',
            macroName: 'Nombre (ej.: VNT)',
            clickDieToAdd: 'Haz clic en un dado para añadirlo al área seleccionada',
            zoneHighest: 'Mayor (tira X, conserva el mayor)',
            zoneLowest: 'Menor (tira X, conserva el menor)',
            addToSum: '+ Añadir a la suma',
            finalSum: 'Suma final (Resultado)',
            addMod: 'Añadir mod',
            import: 'Importar',
            export: 'Exportar',
            delete: 'Borrar',
            cancel: 'Cancelar',
            save: 'Guardar',
            toggleDice: 'Mostrar/Ocultar dados estándar',
            createMacro: 'Crear macro',
            chatTo: 'Chat para:',
            showRecipientsTitle: 'Mostrar destinatarios en el mensaje',
            visibleNames: 'Nombres visibles',
            replyingTo: 'Respondiendo a...',
            sendImage: 'Enviar imagen',
            typeMessage: 'Escribe un mensaje... (Pega imágenes aquí)',
            send: 'Enviar',
            diceHelp: 'Clic: Tirar | Ctrl+Clic: Para GM | Shift+Clic: A ciegas',
            rollModeOpen: 'Abierto',
            rollModeGm: 'GM',
            rollModeBlind: 'A ciegas',
            rollModeGroup: 'Grupo',
            rollModeSelf: 'Yo'
        },
        system: {
            invalidFile: 'Archivo inválido.',
            chatImported: 'Chat importado.',
            chatCleared: 'Chat limpiado.',
            clearChatConfirm: 'Esto borrará el historial de chat guardado del host. ¿Continuar?',
            importChatConfirm: 'Importar reemplazará el chat guardado del host. ¿Continuar?',
            imagesOnly: 'Solo se admiten archivos de imagen.',
            newIdGenerated: 'Nuevo ID generado con éxito.',
            idRecovered: 'ID recuperado. Compártelo para hospedar.',
            connectionError: 'Error de conexión: {type}',
            idCopied: '¡ID copiado!',
            copyIdManually: 'Copia el ID manualmente.',
            copyError: 'Error al copiar.',
            joinedTable: '¡Conectado a la mesa del GM!',
            connectionLost: 'Conexión perdida.',
            originalNotFound: 'Mensaje original no encontrado.',
            playerJoined: '{name} se unió a la mesa.',
            playerLeft: '{name} se desconectó.',
            resetIdConfirm: 'Generar un nuevo ID desconectará a todos los jugadores actuales si eres el GM. ¿Continuar?'
        },
        status: {
            waitingConnection: 'Esperando conexión',
            hosting: 'Hospedando',
            connected: 'Conectado'
        },
        chat: {
            hiddenRecipients: 'Oculto',
            replyingToSender: 'Respondiendo a {sender}:',
            replyToImageLabel: '[Imagen]',
            replyPrivate: 'Responder en privado',
            replyAll: 'Responder a todos',
            deleteMessage: 'Borrar mensaje',
            deleteRoll: 'Borrar tirada',
            macroHoldToEdit: 'Mantén pulsado para editar'
        },
        user: {
            anonymous: 'Anónimo',
            traveler: 'Viajero'
        },
        dice: {
            whisper: 'Susurro',
            repliedTo: 'Respondió a {sender}:',
            rollVerb: 'tira',
            deleted: 'BORRADA',
            messageDeleted: 'MENSAJE BORRADO',
            undoAvailable: '(deshacer disponible hasta borrar definitivo)',
            undo: 'Deshacer',
            hardDelete: 'Borrar definitivo',
            blindTitle: 'A ciegas',
            gmTitle: 'Para GM',
            selfTitle: 'Solo yo',
            groupTitle: 'Grupo'
        }
    }
};

let currentLanguage = 'en';

function mapBrowserLanguageToSupported(lang) {
    if (!lang || typeof lang !== 'string') return 'en';
    const normalized = lang.trim();
    const lower = normalized.toLowerCase();
    if (lower === 'pt-br' || lower === 'pt_br') return 'pt-BR';
    if (lower.startsWith('pt')) return 'pt-BR';
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('en')) return 'en';
    return 'en';
}

function detectInitialLanguage() {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && I18N[saved]) return saved;
    const langs = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    for (const l of langs) {
        const mapped = mapBrowserLanguageToSupported(l);
        if (I18N[mapped]) return mapped;
    }
    return 'en';
}

function t(key, vars) {
    const langPack = I18N[currentLanguage] || I18N.en;
    const parts = String(key || '').split('.');
    let value = langPack;
    for (const p of parts) {
        if (!value || typeof value !== 'object') { value = null; break; }
        value = value[p];
    }
    if (typeof value !== 'string') {
        value = I18N.en;
        for (const p of parts) {
            if (!value || typeof value !== 'object') { value = null; break; }
            value = value[p];
        }
    }
    const str = (typeof value === 'string') ? value : String(key);
    if (!vars || typeof vars !== 'object') return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : String(vars[k])));
}

function applyI18nToDom() {
    document.documentElement.lang = currentLanguage;

    const titleEl = document.getElementById('page-title');
    if (titleEl) document.title = titleEl.textContent;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const k = el.getAttribute('data-i18n');
        if (!k) return;
        el.innerHTML = t(k);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const k = el.getAttribute('data-i18n-title');
        if (!k) return;
        el.setAttribute('title', t(k));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const k = el.getAttribute('data-i18n-placeholder');
        if (!k) return;
        el.setAttribute('placeholder', t(k));
    });
}

function setLanguage(lang, persist = true) {
    const mapped = mapBrowserLanguageToSupported(lang);
    currentLanguage = I18N[mapped] ? mapped : 'en';
    if (persist) localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    if (languageSelect) languageSelect.value = currentLanguage;
    applyI18nToDom();
}

if (languageSelect) {
    languageSelect.addEventListener('change', () => {
        setLanguage(languageSelect.value, true);
    });
}

let isRestoringHistory = false;
let hostChatHistory = [];
let hostPlayerProfiles = [];
let hasSentJoin = false;

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomSymbol() {
    const symbols = [
        '⚔️', '🛡️', '🧙', '🧝',
        '🐉', '🦊', '🐺',
        '🔥', '❄️', '⚡',
        '�', '🎲'
    ];
    return randomFrom(symbols);
}

function normalizeSymbol(s) {
    return (s || '').trim();
}

function getMyBaseName() {
    return nameInput.value.trim() || t('user.anonymous');
}

function getMySymbol() {
    return normalizeSymbol(symbolInput ? symbolInput.value : '');
}

function getMyDisplayPrefix() {
    const sym = getMySymbol();
    return sym ? `${sym} ` : '';
}

// Scroll Logic
let userHasScrolledUp = false;

chatMessages.addEventListener('scroll', () => {
    const distanceToBottom = chatMessages.scrollHeight - chatMessages.scrollTop - chatMessages.clientHeight;

    // Se usuário rolou pra cima (> 100px do fundo)
    if (distanceToBottom > 100) {
        userHasScrolledUp = true;
        scrollDownBtn.classList.remove('hidden-btn');
        // Se já leu, remove o destaque de nova mensagem
        if (distanceToBottom < 150) scrollDownBtn.classList.remove('has-new');
    } else {
        userHasScrolledUp = false;
        scrollDownBtn.classList.add('hidden-btn');
        scrollDownBtn.classList.remove('has-new');
    }
});

function scrollToBottom(force = false) {
    // Se for forçado (clique botão) ou se usuário não estiver lendo histórico
    if (force || !userHasScrolledUp) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        userHasScrolledUp = false;
        scrollDownBtn.classList.add('hidden-btn');
        scrollDownBtn.classList.remove('has-new');
    } else {
        // Se chegou mensagem e usuário está lendo histórico, avisa
        scrollDownBtn.classList.add('has-new');
    }
}

function renderChatMessageInto(div, msgData) {
    messageStore[msgData.id] = msgData;

    const sender = msgData.sender;
    let text = msgData.content;
    const isMe = msgData.senderId === myPeerId;
    const isWhisper = msgData.targets && !msgData.targets.includes('all');
    const hideRecipients = msgData.hideRecipients;
    const replyTo = msgData.replyTo;
    const formattedTime = getFormattedTimestamp(msgData.timestamp);

    let contentHtml = "";

    if (msgData.type === 'image') {
        contentHtml = generateImageHTML(text, true);
    } else {
        let hasImage = false;
        const processedText = text.replace(
            /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|gif|webp|svg)[^\s]*)/ig,
            (url) => {
                hasImage = true;
                return generateImageHTML(url, false);
            }
        );

        if (hasImage) {
            contentHtml = `<span class="text-zinc-200 block mt-1 break-words message-content-text">${isWhisper ? `<span class="text-xs opacity-70">(${t('dice.whisper')})</span> ` : ""}${processedText}</span>`;
        } else {
            contentHtml = `<span class="text-zinc-200 block mt-1 break-words message-content-text">${isWhisper ? `<span class="text-xs opacity-70">(${t('dice.whisper')})</span> ` : ""}${text}</span>`;
        }
    }

    let recipientsText = "";
    if (!hideRecipients) {
        recipientsText = resolveTargetNames(msgData.targets);
    } else if (isMe) {
        recipientsText = resolveTargetNames(msgData.targets) + ` (${t('chat.hiddenRecipients')})`;
    }

    div.id = msgData.id;
    div.className = "message-container relative group mb-2";

    let bgClass = isMe ? "bg-amber-900/20 border-amber-800/50" : "bg-zinc-800/50 border-zinc-700/50";
    const alignClass = isMe ? "ml-auto" : "";
    const recipientHtml = recipientsText ? `<span class="text-xs text-zinc-400 ml-1 font-normal">${recipientsText}</span>` : "";

    let quoteHtml = "";
    if (replyTo) {
        const replyText = replyTo.text.startsWith('data:image') ? t('chat.replyToImageLabel') : replyTo.text;
        quoteHtml = `
        <div class="mb-1 pl-2 border-l-2 border-zinc-600 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onclick="event.stopPropagation(); scrollToMessage('${replyTo.id}')">
            <div class="text-[10px] text-amber-500 font-bold">${t('dice.repliedTo', { sender: replyTo.sender })}</div>
            <div class="text-[10px] text-zinc-400 truncate">${replyText}</div>
        </div>`;
    }

    const replySenderBtn = `<button class="hover:text-amber-400 p-1" title="${t('chat.replyPrivate')}" onclick='event.stopPropagation(); initiateReply("sender", ${JSON.stringify(msgData)})'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg></button>`;
    let replyGroupBtn = !hideRecipients ? `<button class="hover:text-emerald-400 p-1 ml-1" title="${t('chat.replyAll')}" onclick='event.stopPropagation(); initiateReply("group", ${JSON.stringify(msgData)})'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></button>` : "";

    let deleteBtn = "";
    if (isMe || isHost) {
        deleteBtn = `<button class="hover:text-red-500 p-1 ml-1" title="${t('chat.deleteMessage')}" onclick='event.stopPropagation(); softDeleteMessage("${msgData.id}", "${msgData.senderId}")'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>`;
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

function renderDiceMessageInto(div, msgData) {
    messageStore[msgData.id] = msgData;

    const sender = msgData.sender;
    const dice = msgData.dice;
    const result = msgData.result;
    const isMe = msgData.senderId === myPeerId;
    const rollMode = msgData.rollMode;
    const formattedTime = getFormattedTimestamp(msgData.timestamp);

    div.id = msgData.id;
    div.className = "message-container relative group mb-2";

    const isMasterRoll = sender.includes("★");
    let borderClass = isMasterRoll ? "border-red-900/60 bg-red-900/10" : "border-amber-700/30 bg-amber-900/10";

    if (rollMode === 'blind') borderClass = "border-purple-900/60 bg-purple-900/10";
    else if (rollMode === 'gm' || rollMode === 'self') borderClass = "border-zinc-700/50 bg-zinc-800/30";

    let icon = "";
    if (rollMode === 'blind') icon = `<span title="${t('dice.blindTitle')}">👁️‍🗨️</span> `;
    if (rollMode === 'gm') icon = `<span title="${t('dice.gmTitle')}">🛡️</span> `;
    if (rollMode === 'self') icon = `<span title="${t('dice.selfTitle')}">👤</span> `;
    if (rollMode === 'group') icon = `<span title="${t('dice.groupTitle')}">👥</span> `;

    const isComplex = typeof result === 'string' && result.includes('<div');

    let deleteBtn = "";
    if (isMe || isHost) {
        deleteBtn = `<div class="message-actions absolute top-1 right-2 flex text-zinc-500 bg-zinc-900/50 rounded backdrop-blur-sm transition-opacity"><button class="hover:text-red-500 p-1" title="${t('chat.deleteRoll')}" onclick='event.stopPropagation(); softDeleteMessage("${msgData.id}", "${msgData.senderId}")'><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></div>`;
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

function getFormattedTimestamp(ts) {
    const d = new Date(ts || Date.now());
    const pad = n => n.toString().padStart(2, '0');
    const ms = d.getMilliseconds().toString().padStart(3, '0').slice(0, 2);
    // Timezone string (short)
    const match = d.toString().match(/\((.+)\)/);
    const tz = match ? match[1] : 'UTC';
    return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms} (${tz})`;
}

// --- DICE TOGGLE LOGIC ---
let showStandardDice = true;

// Inicializa estado
const savedDiceState = localStorage.getItem('rpg_p2p_show_dice');
if (savedDiceState !== null) {
    showStandardDice = savedDiceState === 'true';
}

function updateDiceVisibility() {
    const dice = document.querySelectorAll('.standard-die');
    dice.forEach(d => {
        if (showStandardDice) d.classList.remove('hidden');
        else d.classList.add('hidden');
    });

    // Atualiza ícone
    if (showStandardDice) {
        toggleDiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        toggleDiceBtn.classList.replace('text-zinc-600', 'text-zinc-500');
    } else {
        toggleDiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        toggleDiceBtn.classList.replace('text-zinc-500', 'text-zinc-600');
    }
}

toggleDiceBtn.onclick = () => {
    showStandardDice = !showStandardDice;
    localStorage.setItem('rpg_p2p_show_dice', showStandardDice);
    updateDiceVisibility();
};

// --- MACRO SYSTEM STATE ---
let macros = [];
let editingMacroId = null;
let selectedZone = 'sum'; // 'highest', 'lowest', 'sum'
let editorState = {
    name: '',
    icon: '⚔️',
    highest: [],
    lowest: [],
    sum: [] // Can contain {type: 'die', val: 20}, {type: 'mod', val: 5}, {type: 'group', mode: 'highest', items: []}
};

function generateUUID() {
    return 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}

function generateProfileId() {
    return 'prof-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}

function setHostMode(flag) {
    isHost = !!flag;
    if (hostChatControls) {
        if (isHost) hostChatControls.classList.remove('hidden');
        else hostChatControls.classList.add('hidden');
    }
}

function safeJsonParse(text) {
    try { return JSON.parse(text); } catch { return null; }
}

function loadHostProfilesFromStorage() {
    const raw = localStorage.getItem(HOST_PROFILES_STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    hostPlayerProfiles = Array.isArray(parsed) ? parsed : [];
}

function saveHostProfilesToStorage() {
    localStorage.setItem(HOST_PROFILES_STORAGE_KEY, JSON.stringify(hostPlayerProfiles));
}

function loadHostChatHistoryFromStorage() {
    const raw = localStorage.getItem(HOST_CHAT_STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    hostChatHistory = Array.isArray(parsed) ? parsed : [];
}

function saveHostChatHistoryToStorage() {
    localStorage.setItem(HOST_CHAT_STORAGE_KEY, JSON.stringify(hostChatHistory));
}

function clearChatUI() {
    chatMessages.innerHTML = '';
}

function restoreChatFromHostHistory() {
    if (!isHost) return;
    loadHostChatHistoryFromStorage();
    clearChatUI();

    isRestoringHistory = true;
    try {
        hostChatHistory.forEach((evt) => {
            if (!evt || typeof evt !== 'object') return;
            if (evt.type === 'chat' || evt.type === 'image') addChatMessage(evt);
            else if (evt.type === 'dice') addDiceMessage(evt);
            else if (evt.type === 'soft-delete') applySoftDeleteUI(evt);
            else if (evt.type === 'undo-delete') applyUndoDeleteUI(evt);
            else if (evt.type === 'hard-delete') applyHardDeleteUI(evt);
        });
    } finally {
        isRestoringHistory = false;
    }

    setTimeout(() => scrollToBottom(true), 50);
}

function persistHostChatEvent(evt) {
    if (!isHost || isRestoringHistory) return;
    if (!evt || typeof evt !== 'object') return;
    const allowed = ['chat', 'image', 'dice', 'soft-delete', 'undo-delete', 'hard-delete'];
    if (!allowed.includes(evt.type)) return;
    hostChatHistory.push(evt);
    saveHostChatHistoryToStorage();
}

function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function bindHostChatButtons() {
    if (!btnExportChat || !btnImportChat || !btnClearChat || !chatImportFile) return;

    btnExportChat.onclick = () => {
        if (!isHost) return;
        loadHostChatHistoryFromStorage();
        loadHostProfilesFromStorage();
        downloadJson(`rpg-direct-chat-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`, {
            version: 1,
            exportedAt: Date.now(),
            chatHistory: hostChatHistory,
            playerProfiles: hostPlayerProfiles
        });
    };

    btnImportChat.onclick = () => {
        if (!isHost) return;
        chatImportFile.click();
    };

    chatImportFile.onchange = async () => {
        if (!isHost) return;
        const file = chatImportFile.files && chatImportFile.files[0];
        chatImportFile.value = '';
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

        hostChatHistory = importedHistory;
        saveHostChatHistoryToStorage();

        hostPlayerProfiles = importedProfiles;
        saveHostProfilesToStorage();

        restoreChatFromHostHistory();
        addSystemMessage(t('system.chatImported'));
    };

    btnClearChat.onclick = () => {
        if (!isHost) return;
        if (!confirm(t('system.clearChatConfirm'))) return;
        hostChatHistory = [];
        saveHostChatHistoryToStorage();
        messageStore = {};
        clearChatUI();
        addSystemMessage(t('system.chatCleared'));
    };
}

function getMyDisplayName() {
    let name = `${getMyDisplayPrefix()}${getMyBaseName()}`;
    if (isHost) name += " ★"; // Alterado para estrela
    return name;
}

function ensureIdentityDefaults() {
    if (nameInput && !nameInput.value.trim()) {
        nameInput.value = t('user.traveler') + " " + Math.floor(Math.random() * 100);
    }
    if (symbolInput && !symbolInput.value.trim()) {
        symbolInput.value = generateRandomSymbol();
    }
}

function loadIdentityFromStorage() {
    const savedName = localStorage.getItem('rpg_p2p_player_name');
    const savedSymbol = localStorage.getItem('rpg_p2p_player_symbol');

    if (nameInput && savedName) nameInput.value = savedName;
    if (symbolInput && savedSymbol) symbolInput.value = savedSymbol;
}

function saveIdentityToStorage() {
    if (nameInput) localStorage.setItem('rpg_p2p_player_name', getMyBaseName());
    if (symbolInput) localStorage.setItem('rpg_p2p_player_symbol', getMySymbol());
}

ensureIdentityDefaults();

// --- INITIALIZATION ---
window.onload = () => {
    setLanguage(detectInitialLanguage(), true);

    loadIdentityFromStorage();
    ensureIdentityDefaults();
    saveIdentityToStorage();

    bindHostChatButtons();

    const versionEl = document.getElementById('app-version');
    if (versionEl) versionEl.innerText = `v${APP_VERSION}`;

    loadMacros();
    renderMacroButtons();
    updateDiceVisibility(); // Aplicar estado inicial dos dados
    initPeer(); // Inicialização controlada

    // Carregar ID do Mestre salvo (Novo)
    const savedRemoteId = localStorage.getItem('rpg_p2p_remote_id');
    if (savedRemoteId) {
        remoteIdInput.value = savedRemoteId;
    }
};

if (nameInput) nameInput.addEventListener('change', () => { ensureIdentityDefaults(); saveIdentityToStorage(); broadcastPlayerList(); updateRecipientsUI(); });
if (symbolInput) symbolInput.addEventListener('change', () => { ensureIdentityDefaults(); saveIdentityToStorage(); broadcastPlayerList(); updateRecipientsUI(); });
if (symbolInput) symbolInput.addEventListener('input', () => { ensureIdentityDefaults(); saveIdentityToStorage(); broadcastPlayerList(); updateRecipientsUI(); });

// --- IMAGE HANDLING ---
imageInput.onchange = function() {
    const file = this.files[0];
    if (file) sendImage(file);
    this.value = ''; // reset
};

// Paste support
chatInput.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.includes('image/')) {
            const blob = item.getAsFile();
            sendImage(blob);
            e.preventDefault(); // Prevent pasting the binary code into text
        }
    }
});

// --- DRAG AND DROP ---
const body = document.body;

window.addEventListener('dragover', (e) => {
    e.preventDefault();
    body.classList.add('drag-active');
});

window.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null || e.clientX === 0 || e.clientY === 0) {
        body.classList.remove('drag-active');
    }
});

window.addEventListener('drop', (e) => {
    e.preventDefault();
    body.classList.remove('drag-active');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            sendImage(file);
        } else {
            addSystemMessage(t('system.imagesOnly'));
        }
    }
});

function sendImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        const myName = getMyDisplayName();
        const targets = getSelectedTargets();
        const isGroupMode = groupToggle.checked;
        const msgId = generateUUID();

        const payload = {
            id: msgId,
            type: 'image',
            sender: myName,
            senderId: myPeerId,
            content: base64, // The image data
            fileName: file.name || 'imagem.png',
            targets: targets,
            hideRecipients: !isGroupMode,
            replyTo: replyingTo,
            timestamp: Date.now()
        };

        messageStore[payload.id] = payload;

        // Standard sending logic (Host relay or Client send)
        if (isHost) {
            handleData(payload);
        } else if (conn && conn.open) {
            conn.send(payload);
            addChatMessage(payload);
        } else if (!conn && !isHost) {
            addChatMessage(payload); // Offline testing
        }

        cancelReply();
    };
    reader.readAsDataURL(file);
}

function loadMacros() {
    const saved = localStorage.getItem('rpg_p2p_macros');
    if (saved) {
        try {
            macros = JSON.parse(saved);
        } catch(e) { console.error('Error loading macros', e); }
    }
}

function saveMacrosToStorage() {
    localStorage.setItem('rpg_p2p_macros', JSON.stringify(macros));
    renderMacroButtons();
}

// --- PEERJS SETUP & PERSISTENCE ---

function initPeer(forceNew = false) {
    if (peer) {
        // Se já existir, destrói para recriar (caso de reset)
        peer.destroy();
    }

    // Tenta recuperar ID salvo
    let savedId = localStorage.getItem('rpg_p2p_host_id');

    // Se forçar novo, ignora o salvo
    if (forceNew) savedId = null;

    if (savedId) {
        peer = new Peer(savedId);
    } else {
        peer = new Peer(); // Gera novo aleatório
    }

    // Configurar Eventos do Peer
    peer.on('open', (id) => {
        myPeerId = id;
        // Salva o ID novo (ou confirma o antigo)
        localStorage.setItem('rpg_p2p_host_id', id);

        peerIdDisplay.innerText = id;
        myIdBox.classList.remove('hidden');
        statusDot.classList.replace('bg-red-500', 'bg-blue-500');
        statusDot.title = t('status.waitingConnection');

        // Se você não está tentando entrar como jogador, você é o host (mestre)
        setHostMode(!isJoiningAsPlayer);
        if (isHost) {
            loadHostProfilesFromStorage();
            restoreChatFromHostHistory();
        }

        if (forceNew) addSystemMessage(t('system.newIdGenerated'));
        else addSystemMessage(t('system.idRecovered'));

        updateRecipientsUI();
    });

    peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
            // ID está preso ou em uso. Gerar um novo automaticamente.
            console.warn("ID salvo indisponível. Gerando novo...");
            initPeer(true);
        } else {
            console.error('PeerJS Error:', err);
            addSystemMessage(t('system.connectionError', { type: err.type }));
        }
    });

    // Lógica do Host
    peer.on('connection', (newConn) => {
        setHostMode(true);
        statusDot.classList.replace('bg-blue-500', 'bg-green-500');
        statusDot.title = t('status.hosting');

        newConn.on('open', () => {
            connections.push(newConn);
            loadHostProfilesFromStorage();
            newConn.send({ type: 'profiles', profiles: hostPlayerProfiles });
            broadcastPlayerList();
        });
        newConn.on('data', (data) => {
            if (data.type === 'join') {
                if (data && data.profileId) {
                    loadHostProfilesFromStorage();
                    const existing = hostPlayerProfiles.find(p => p && p.profileId === data.profileId);
                    if (existing) {
                        if (typeof data.name === 'string' && data.name.trim()) existing.baseName = data.name.trim();
                        if (typeof data.symbol === 'string' && data.symbol.trim()) existing.symbol = data.symbol.trim();
                    } else {
                        hostPlayerProfiles.push({
                            profileId: data.profileId,
                            baseName: typeof data.name === 'string' ? data.name.trim() : null,
                            symbol: typeof data.symbol === 'string' ? data.symbol.trim() : null
                        });
                    }
                    saveHostProfilesToStorage();
                }

                upsertKnownPlayer(newConn.peer, data);
                handlePlayerJoin(newConn.peer, getPlayerDisplayNameFromData(data));
                newConn.send({ type: 'profiles', profiles: hostPlayerProfiles });
            } else if (data.type === 'request-profiles') {
                loadHostProfilesFromStorage();
                newConn.send({ type: 'profiles', profiles: hostPlayerProfiles });
            } else {
                handleData(data);
            }
        });
        newConn.on('close', () => handlePlayerLeave(newConn.peer));
    });
}

// Botão de Reset manual
btnResetId.onclick = () => {
    if(confirm(t('system.resetIdConfirm'))) {
        initPeer(true);
    }
};

peerIdDisplay.onclick = () => {
    const textToCopy = peerIdDisplay.innerText;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        if (document.execCommand('copy')) {
            addSystemMessage(t('system.idCopied'));
            const originalColor = peerIdDisplay.style.color;
            peerIdDisplay.style.color = "#4ade80";
            setTimeout(() => { peerIdDisplay.style.color = originalColor; }, 1000);
        } else addSystemMessage(t('system.copyIdManually'));
    } catch (err) { addSystemMessage(t('system.copyError')); }
    document.body.removeChild(textArea);
};

function handlePlayerJoin(id, name) {
    const idx = knownPlayers.findIndex(p => p.id === id);
    if (idx >= 0) knownPlayers[idx].name = name;
    else knownPlayers.push({ id: id, name: name });
    addSystemMessage(t('system.playerJoined', { name }));
    broadcastPlayerList();
    updateRecipientsUI();
}

function getPlayerDisplayNameFromData(data) {
    const n = (data && typeof data.name === 'string' && data.name.trim()) ? data.name.trim() : t('user.anonymous');
    const sym = normalizeSymbol(data && data.symbol);
    const prefix = sym ? `${sym} ` : '';
    return `${prefix}${n}`;
}

function upsertKnownPlayer(id, data) {
    const idx = knownPlayers.findIndex(p => p.id === id);
    const name = getPlayerDisplayNameFromData(data);
    if (idx >= 0) {
        knownPlayers[idx].name = name;
        knownPlayers[idx].baseName = (data && data.name) ? data.name : knownPlayers[idx].baseName;
        knownPlayers[idx].symbol = (data && data.symbol) ? data.symbol : knownPlayers[idx].symbol;
        knownPlayers[idx].profileId = (data && data.profileId) ? data.profileId : knownPlayers[idx].profileId;
    } else {
        knownPlayers.push({
            id,
            name,
            baseName: data && data.name ? data.name : null,
            symbol: data && data.symbol ? data.symbol : null,
            profileId: data && data.profileId ? data.profileId : null
        });
    }
}

function handlePlayerLeave(id) {
    const p = knownPlayers.find(pl => pl.id === id);
    if (p) addSystemMessage(t('system.playerLeft', { name: p.name }));
    knownPlayers = knownPlayers.filter(pl => pl.id !== id);
    connections = connections.filter(c => c.peer !== id);
    broadcastPlayerList();
    updateRecipientsUI();
}

function broadcastPlayerList() {
    const fullList = [{ id: myPeerId, name: getMyBaseName(), symbol: getMySymbol(), isHost: true }, ...knownPlayers.map(p => ({ id: p.id, name: p.baseName || p.name, symbol: p.symbol || null, profileId: p.profileId || null }))];
    connections.forEach(c => { if(c.open) c.send({ type: 'player-list', list: fullList }); });
}

btnConnect.onclick = () => {
    const remoteId = remoteIdInput.value.trim();
    if (!remoteId) return;

    isJoiningAsPlayer = true;
    setHostMode(false);

    // Salvar ID do Mestre (Novo)
    localStorage.setItem('rpg_p2p_remote_id', remoteId);

    conn = peer.connect(remoteId);
    conn.on('open', () => {
        statusDot.classList.replace('bg-blue-500', 'bg-green-500');
        statusDot.title = t('status.connected');
        addSystemMessage(t('system.joinedTable'));
        document.getElementById('join-controls').classList.add('hidden');
        ensureIdentityDefaults();
        saveIdentityToStorage();

        // Aguarda perfis do host antes de enviar join
        hasSentJoin = false;
        conn.send({ type: 'request-profiles' });
    });
    conn.on('data', (data) => handleData(data));
    conn.on('close', () => {
        addSystemMessage(t('system.connectionLost'));
        statusDot.classList.replace('bg-green-500', 'bg-red-500');
        knownPlayers = [];
        updateRecipientsUI();
    });
};

function handleData(data) {
    if (data.type === 'profiles') {
        if (isHost) return;
        if (hasSentJoin) return;

        const profiles = Array.isArray(data.profiles) ? data.profiles : [];
        const currentName = getMyBaseName();
        const currentSymbol = getMySymbol();

        let selectedProfile = profiles.find(p => p && typeof p.baseName === 'string' && p.baseName.trim().toLowerCase() === currentName.trim().toLowerCase()) || null;
        let profileId = selectedProfile ? selectedProfile.profileId : (localStorage.getItem(LOCAL_PROFILE_ID_KEY) || null);

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
                        if (selectedProfile.baseName) nameInput.value = selectedProfile.baseName;
                        if (selectedProfile.symbol) symbolInput.value = selectedProfile.symbol;
                    }
                } else if (raw) {
                    nameInput.value = raw;
                }
            } else {
                // Nenhum perfil salvo: cria com o nome atual
            }
        }

        if (!profileId) profileId = generateProfileId();
        localStorage.setItem(LOCAL_PROFILE_ID_KEY, profileId);
        ensureIdentityDefaults();
        saveIdentityToStorage();

        if (conn && conn.open) {
            conn.send({ type: 'join', profileId, name: getMyBaseName(), symbol: getMySymbol() });
            hasSentJoin = true;
        }
        return;
    }

    if (data.type === 'player-list') {
        knownPlayers = [];
        data.list.filter(p => p.id !== myPeerId).forEach(p => upsertKnownPlayer(p.id, p));
        updateRecipientsUI();
        return;
    }

    // Store originals so undo can restore even if the element is replaced
    if (data && data.id && (data.type === 'chat' || data.type === 'image' || data.type === 'dice')) {
        messageStore[data.id] = data;
    }

    const amITarget = !data.targets || data.targets.includes('all') || data.targets.includes(myPeerId) || data.senderId === myPeerId;

    if (isHost) {
        if (data.targets && !data.targets.includes('all')) {
            const targetIds = data.targets;
            connections.forEach(c => { if (targetIds.includes(c.peer) && c.open) c.send(data); });
        } else {
            connections.forEach(c => { if (c.peer !== data.senderId && c.open) c.send(data); });
        }
    }

    persistHostChatEvent(data);

    const isDeleteEvent = data.type === 'soft-delete' || data.type === 'undo-delete' || data.type === 'hard-delete';

    // Processar mensagens normais (Chat, Dice, Image) ou Delete Events
    if (amITarget || isDeleteEvent) {
        if (data.type === 'chat' || data.type === 'image') {
            addChatMessage(data);
        } else if (data.type === 'dice') {
            let displayResult = data.result;
            let displaySender = data.sender;

            if (data.rollMode === 'blind' && data.senderId === myPeerId) displayResult = "?? (Cegas)";
            if (data.rollMode === 'blind') displaySender += " (Cegas)";
            else if (data.rollMode === 'gm' || data.rollMode === 'self') displaySender += " (Privado)";

            // Corrigido: Passa o objeto completo para addDiceMessage
            let diceData = {...data, sender: displaySender, result: displayResult};
            addDiceMessage(diceData);
        } else if (data.type === 'soft-delete') {
            applySoftDeleteUI(data);
        } else if (data.type === 'undo-delete') {
            applyUndoDeleteUI(data);
        } else if (data.type === 'hard-delete') {
            applyHardDeleteUI(data);
        }
    }

    // Garantir scroll após renderizar
    setTimeout(() => scrollToBottom(false), 50);
}

function getHostPeerId() {
    if (isHost) return myPeerId;
    return conn ? conn.peer : null;
}

function sendDeleteEvent(payload) {
    if (isHost) {
        handleData(payload);
        return;
    }

    if (conn && conn.open) {
        conn.send(payload);
        return;
    }

    // Offline
    handleData(payload);
}

// --- DELETE MESSAGE LOGIC (soft-delete / undo / hard-delete) ---
function softDeleteMessage(msgId, originalSenderId) {
    const originalPayload = messageStore[msgId] || null;

    const payload = {
        type: 'soft-delete',
        id: msgId,
        actorId: myPeerId,
        originalSenderId: originalSenderId,
        originalPayload: originalPayload
    };

    // Optimistic UI
    applySoftDeleteUI(payload);
    sendDeleteEvent(payload);
}

function undoDeleteMessage(msgId) {
    const originalPayload = messageStore[msgId] || null;

    const payload = {
        type: 'undo-delete',
        id: msgId,
        actorId: myPeerId,
        originalSenderId: originalPayload ? originalPayload.senderId : null,
        originalPayload: originalPayload
    };

    applyUndoDeleteUI(payload);
    sendDeleteEvent(payload);
}

function hardDeleteMessage(msgId, originalSenderId) {
    const originalPayload = messageStore[msgId] || null;

    const payload = {
        type: 'hard-delete',
        id: msgId,
        actorId: myPeerId,
        originalSenderId: originalSenderId || (originalPayload ? originalPayload.senderId : null),
        originalPayload: originalPayload
    };

    applyHardDeleteUI(payload);
    sendDeleteEvent(payload);
}

function buildDeletedPlaceholderInnerHTML(msgId, actorId, originalSenderId, isFinal) {
    const actorIsMe = actorId === myPeerId;
    const canAct = (actorIsMe || isHost);

    const undoBtn = (!isFinal && canAct)
        ? `<button class="hover:text-emerald-400 p-1" title="${t('dice.undo')}" onclick='event.stopPropagation(); undoDeleteMessage("${msgId}")'>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7v6h6"></path>
                <path d="M3 13a9 9 0 1 0 3-7"></path>
            </svg>
        </button>`
        : '';

    const deleteBtn = (!isFinal && canAct)
        ? `<button class="hover:text-red-500 p-1 ml-1" title="${t('dice.hardDelete')}" onclick='event.stopPropagation(); hardDeleteMessage("${msgId}", "${originalSenderId || ''}")'>
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

function applySoftDeleteUI(data) {
    const msgId = data.id;
    const el = document.getElementById(msgId);
    if (!el) return;

    if (data.originalPayload && data.originalPayload.id) {
        messageStore[data.originalPayload.id] = data.originalPayload;
    }

    el.classList.add('deleted-placeholder');
    el.innerHTML = buildDeletedPlaceholderInnerHTML(msgId, data.actorId, data.originalSenderId, false);
}

function applyUndoDeleteUI(data) {
    const msgId = data.id;
    const el = document.getElementById(msgId);
    if (!el) return;

    const originalPayload = data.originalPayload || messageStore[msgId];
    if (!originalPayload) return;

    messageStore[msgId] = originalPayload;
    el.classList.remove('deleted-placeholder');

    if (originalPayload.type === 'dice') {
        renderDiceMessageInto(el, originalPayload);
    } else {
        renderChatMessageInto(el, originalPayload);
    }
}

function applyHardDeleteUI(data) {
    const msgId = data.id;
    const el = document.getElementById(msgId);
    if (!el) return;

    const hostId = getHostPeerId();
    const actorIsHost = data.actorId && hostId && data.actorId === hostId;

    if (actorIsHost) {
        el.remove();
        return;
    }

    // Player hard delete: host keeps final placeholder; everyone else removes.
    if (isHost) {
        el.classList.add('deleted-placeholder');
        el.innerHTML = buildDeletedPlaceholderInnerHTML(msgId, data.actorId, data.originalSenderId, true);
    } else {
        el.remove();
    }
}

// --- MACRO EDITOR LOGIC ---

function openMacroEditor(isNew, macroIndex = null) {
    editingMacroId = isNew ? null : macroIndex;

    if (isNew) {
        editorState = { name: '', icon: '⚔️', highest: [], lowest: [], sum: [] };
    } else {
        // Deep copy
        editorState = JSON.parse(JSON.stringify(macros[macroIndex]));
    }

    document.getElementById('macro-name').value = editorState.name;
    document.getElementById('macro-icon').value = editorState.icon;
    selectZone('sum');
    renderEditorZones();
    macroEditor.classList.remove('hidden');
}

function closeMacroEditor() {
    macroEditor.classList.add('hidden');
}

function selectZone(zone) {
    selectedZone = zone;
    zoneHighest.classList.remove('active');
    zoneLowest.classList.remove('active');
    zoneSum.classList.remove('active');

    if (zone === 'highest') zoneHighest.classList.add('active');
    if (zone === 'lowest') zoneLowest.classList.add('active');
    if (zone === 'sum') zoneSum.classList.add('active');
}

function addDieToSelectedZone(sides) {
    if (selectedZone === 'highest') editorState.highest.push({ type: 'die', sides: sides });
    if (selectedZone === 'lowest') editorState.lowest.push({ type: 'die', sides: sides });
    if (selectedZone === 'sum') editorState.sum.push({ type: 'die', sides: sides });
    renderEditorZones();
}

function addGroupToSum(type) {
    // Move items from highest/lowest to a group inside sum
    if (type === 'highest' && editorState.highest.length > 0) {
        editorState.sum.push({ type: 'group', mode: 'highest', items: [...editorState.highest] });
        editorState.highest = [];
    }
    if (type === 'lowest' && editorState.lowest.length > 0) {
        editorState.sum.push({ type: 'group', mode: 'lowest', items: [...editorState.lowest] });
        editorState.lowest = [];
    }
    renderEditorZones();
}

function addModToSum() {
    const val = parseInt(document.getElementById('mod-input').value);
    if (!isNaN(val)) {
        editorState.sum.push({ type: 'mod', value: val });
        document.getElementById('mod-input').value = '';
        renderEditorZones();
    }
}

function removeFromZone(zone, index) {
    if (zone === 'highest') editorState.highest.splice(index, 1);
    if (zone === 'lowest') editorState.lowest.splice(index, 1);
    if (zone === 'sum') editorState.sum.splice(index, 1);
    renderEditorZones();
}

function renderEditorZones() {
    // Helper render
    const renderItem = (item, z, i) => {
        if (item.type === 'die') return `<div onclick="event.stopPropagation(); removeFromZone('${z}', ${i})" class="bg-zinc-700 px-2 rounded text-xs hover:bg-red-900 cursor-pointer">d${item.sides}</div>`;
        if (item.type === 'mod') return `<div onclick="event.stopPropagation(); removeFromZone('${z}', ${i})" class="bg-zinc-600 px-2 rounded text-xs hover:bg-red-900 cursor-pointer">${item.value >=0 ? '+'+item.value : item.value}</div>`;
        if (item.type === 'group') {
            const content = item.items.map(sub => `d${sub.sides}`).join(',');
            return `<div onclick="event.stopPropagation(); removeFromZone('${z}', ${i})" class="bg-zinc-900 border border-zinc-600 px-2 rounded text-[10px] hover:bg-red-900 cursor-pointer flex flex-col items-center"><span>${item.mode === 'highest' ? 'Maior' : 'Menor'}</span><span class="text-zinc-400">(${content})</span></div>`;
        }
    };

    zoneHighest.innerHTML = editorState.highest.map((it, i) => renderItem(it, 'highest', i)).join('');
    zoneLowest.innerHTML = editorState.lowest.map((it, i) => renderItem(it, 'lowest', i)).join('');
    zoneSum.innerHTML = editorState.sum.map((it, i) => renderItem(it, 'sum', i)).join('');
}

function saveMacro() {
    const name = document.getElementById('macro-name').value.trim() || 'Macro';
    editorState.name = name;
    editorState.icon = document.getElementById('macro-icon').value;

    if (editingMacroId !== null) {
        macros[editingMacroId] = editorState;
    } else {
        macros.push(editorState);
    }
    saveMacrosToStorage();
    closeMacroEditor();
}

function deleteMacro() {
    if (editingMacroId !== null) {
        if(confirm("Tem certeza que deseja apagar este macro?")) {
            macros.splice(editingMacroId, 1);
            saveMacrosToStorage();
            closeMacroEditor();
        }
    }
}

function exportMacro() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(editorState));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (editorState.name || "macro") + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importMacro() {
    document.getElementById('macro-file-input').click();
}

function handleFileImport(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            // Validar estrutura básica (opcional, mas bom)
            if (imported.sum && Array.isArray(imported.sum)) {
                editorState = imported;
                document.getElementById('macro-name').value = editorState.name;
                document.getElementById('macro-icon').value = editorState.icon;
                renderEditorZones();
            } else {
                alert(t('system.invalidFile'));
            }
        } catch(err) { alert(t('system.invalidFile')); }
    };
    reader.readAsText(file);
    input.value = ''; // Reset
}

// --- RENDER MACRO BUTTONS ---
function renderMacroButtons() {
    macrosContainer.innerHTML = macros.map((m, i) => {
        return `<button 
            onclick="rollMacro(event, ${i})" 
            oncontextmenu="event.preventDefault(); openMacroEditor(false, ${i})"
            class="macro-btn dice-btn bg-zinc-800 hover:bg-zinc-700 border border-amber-900/50 p-2 rounded flex flex-col items-center min-w-[45px] relative"
            title="${m.name} (${t('chat.macroHoldToEdit')})">
            <span class="text-[10px] text-amber-500 truncate max-w-[40px]">${m.name}</span>
            <span class="text-base">${m.icon}</span>
        </button>`;
    }).join('');

    // Adicionar long-press handlers para mobile
    document.querySelectorAll('.macro-btn').forEach((btn, i) => {
        let pressTimer;
        const start = (e) => {
            if (e.type === 'click') return; // Ignora clique normal
            pressTimer = setTimeout(() => {
                openMacroEditor(false, i);
                if (navigator.vibrate) navigator.vibrate(50);
            }, 2000);
        };
        const cancel = () => clearTimeout(pressTimer);

        btn.addEventListener('mousedown', start);
        btn.addEventListener('touchstart', start, {passive: true});
        btn.addEventListener('mouseup', cancel);
        btn.addEventListener('mouseleave', cancel);
        btn.addEventListener('touchend', cancel);
    });
}

// --- MACRO EXECUTION ---
function rollMacro(e, index) {
    const macro = macros[index];
    if (!macro) return;

    let totalSum = 0;
    let breakdownParts = [];

    // Determinar Modo
    let mode = document.querySelector('input[name="roll-mode"]:checked').value;
    if (e && e.ctrlKey) mode = 'gm';
    else if (e && e.shiftKey) mode = 'blind';

    // Processar Itens
    macro.sum.forEach(item => {
        if (item.type === 'die') {
            const val = Math.floor(Math.random() * item.sides) + 1;
            totalSum += val;
            breakdownParts.push(`d${item.sides}(<b class="text-amber-400">${val}</b>)`);
        } else if (item.type === 'mod') {
            totalSum += item.value;
            breakdownParts.push(`${item.value >= 0 ? '+' : ''}${item.value}`);
        } else if (item.type === 'group') {
            let rolls = item.items.map(sub => Math.floor(Math.random() * sub.sides) + 1);
            let selected = 0;
            if (item.mode === 'highest') selected = Math.max(...rolls);
            else selected = Math.min(...rolls);

            totalSum += selected;
            const rollsStr = rolls.map(r => r === selected ? `<b class="text-amber-400">${r}</b>` : `<span class="opacity-50">${r}</span>`).join(',');
            breakdownParts.push(`[${item.mode === 'highest' ? 'Maior' : 'Menor'}(${rollsStr}) → <b>${selected}</b>]`);
        }
    });

    const resultHtml = `<div class="text-sm font-normal text-zinc-300 mt-1">${breakdownParts.join(' + ')} =</div><div class="text-xl font-bold text-amber-500">${totalSum}</div>`;
    const myName = getMyDisplayName();

    // Determine Targets
    let targets = ['all'];
    if (mode === 'open') targets = ['all'];
    else if (mode === 'gm') targets = isHost ? [myPeerId] : (conn ? [conn.peer, myPeerId] : [myPeerId]);
    else if (mode === 'blind') targets = isHost ? [myPeerId] : (conn ? [conn.peer] : [myPeerId]);
    else if (mode === 'group') targets = getSelectedTargets();
    else if (mode === 'self') targets = [myPeerId];

    const payload = {
        id: generateUUID(),
        type: 'dice',
        sender: myName,
        senderId: myPeerId,
        dice: `Macro: ${macro.name}`,
        result: resultHtml,
        targets: targets,
        rollMode: mode,
        timestamp: Date.now()
    };

    if (isHost) {
        handleData(payload);
    } else if (conn && conn.open) {
        conn.send(payload);
        if (mode === 'blind' && !isHost) {
            // Corrigido para usar objeto
            let diceData = {...payload, result: "?? (Cegas)", sender: myName};
            addDiceMessage(diceData);
        } else if (!targets.includes(myPeerId) && mode !== 'blind') {
            let diceData = {...payload, sender: myName + (mode === 'gm' ? ' (Privado)' : '')};
            addDiceMessage(diceData);
        }
    } else {
        addDiceMessage(payload);
    }
}

// --- UI RECIPIENTS ---
function updateRecipientsUI() {
    recipientsContainer.innerHTML = '<span class="text-zinc-500 mr-1 noselect">Chat Para:</span>';
    createCheckbox('all', 'Todos', true);
    knownPlayers.forEach(player => {
        let displayName = player.name;
        createCheckbox(player.id, displayName, true);
    });
}

function createCheckbox(id, label, checked) {
    const labelEl = document.createElement('label');
    labelEl.className = "cursor-pointer select-none inline-flex items-center noselect";
    const input = document.createElement('input');
    input.type = "checkbox";
    input.className = "recipient-checkbox hidden";
    input.value = id;
    input.checked = checked;
    const div = document.createElement('div');
    div.className = "px-2 py-1 rounded border text-[10px] uppercase font-bold transition-colors border-zinc-700 noselect";
    div.innerText = label;

    input.onchange = () => handleRecipientChange(input);

    let pressTimer;
    let isLongPress = false;
    const selectOnly = (e) => {
        if(e) { e.preventDefault(); e.stopPropagation(); }
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
    labelEl.addEventListener('touchstart', startPress, {passive: false});
    labelEl.addEventListener('mouseup', cancelPress);
    labelEl.addEventListener('mouseleave', cancelPress);
    labelEl.addEventListener('touchend', cancelPress);
    labelEl.addEventListener('touchcancel', cancelPress);
    labelEl.addEventListener('contextmenu', (e) => { if(isLongPress) e.preventDefault(); });

    labelEl.appendChild(input);
    labelEl.appendChild(div);
    recipientsContainer.appendChild(labelEl);
}

function handleRecipientChange(changedInput) {
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

function getSelectedTargets() {
    const allInputs = Array.from(document.querySelectorAll('.recipient-checkbox'));
    const allOption = allInputs.find(i => i.value === 'all');
    if (allOption && allOption.checked) return ['all'];
    const selected = allInputs.filter(i => i.value !== 'all' && i.checked).map(i => i.value);
    return selected.length > 0 ? selected : ['all'];
}

function resolveTargetNames(targetIds) {
    if (!targetIds || targetIds.length === 0 || targetIds.includes('all')) return "[Todos]";
    const names = targetIds.map(id => {
        if (id === myPeerId) return "Você";
        const p = knownPlayers.find(kp => kp.id === id);
        return p ? p.name : "Desconhecido";
    });
    return `[${names.join(', ')}]`;
}

function setCheckboxes(targetIds) {
    const allInputs = document.querySelectorAll('.recipient-checkbox');
    const allOption = Array.from(allInputs).find(i => i.value === 'all');
    allInputs.forEach(input => {
        if (targetIds.includes('all')) input.checked = true;
        else input.checked = targetIds.includes(input.value);
    });
    if (!targetIds.includes('all') && allOption) allOption.checked = false;
}

function initiateReply(mode, msgData) {
    replyingTo = {
        id: msgData.id,
        sender: msgData.sender,
        text: msgData.content
    };
    replyTargetName.innerText = t('chat.replyingToSender', { sender: msgData.sender });
    replyTargetMsg.innerText = msgData.content;
    replyContextBar.classList.remove('hidden');

    if (mode === 'sender') {
        setCheckboxes([msgData.senderId]);
    } else if (mode === 'group') {
        let newTargets = [];
        if (msgData.targets.includes('all')) newTargets = ['all'];
        else {
            newTargets = msgData.targets.filter(id => id !== myPeerId);
            if (!newTargets.includes(msgData.senderId)) newTargets.push(msgData.senderId);
        }
        setCheckboxes(newTargets);
    }
    chatInput.focus();
}

function cancelReply() {
    replyingTo = null;
    replyContextBar.classList.add('hidden');
}

function scrollToMessage(msgId) {
    const el = document.getElementById(msgId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('highlight-message');
        void el.offsetWidth;
        el.classList.add('highlight-message');
    } else {
        addSystemMessage(t('system.originalNotFound'));
    }
}

function sendChat() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    const myName = getMyDisplayName();
    const targets = getSelectedTargets();
    const isGroupMode = groupToggle.checked;
    const msgId = generateUUID();

    const payload = {
        id: msgId,
        type: 'chat',
        sender: myName,
        senderId: myPeerId,
        content: msg,
        targets: targets,
        hideRecipients: !isGroupMode,
        replyTo: replyingTo,
        timestamp: Date.now()
    };

    messageStore[payload.id] = payload;

    if (isHost) {
        handleData(payload);
    } else if (conn && conn.open) {
        conn.send(payload);
        addChatMessage(payload);
    } else if (!conn && !isHost) {
        addChatMessage(payload);
    }

    chatInput.value = "";
    cancelReply();
}

function rollDice(e, sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    const myName = getMyDisplayName();

    let mode = document.querySelector('input[name="roll-mode"]:checked').value;

    if (e && e.ctrlKey) mode = 'gm';
    else if (e && e.shiftKey) mode = 'blind';

    let targets = ['all'];

    if (mode === 'open') {
        targets = ['all'];
    } else if (mode === 'gm') {
        if (isHost) targets = [myPeerId];
        else if (conn) targets = [conn.peer, myPeerId];
        else targets = [myPeerId];
    } else if (mode === 'blind') {
        if (isHost) targets = [myPeerId];
        else if (conn) targets = [conn.peer];
        else targets = [myPeerId];
    } else if (mode === 'group') {
        targets = getSelectedTargets();
    } else if (mode === 'self') {
        targets = [myPeerId];
    }

    const payload = {
        id: generateUUID(),
        type: 'dice',
        sender: myName,
        senderId: myPeerId,
        dice: `D${sides}`,
        result: result,
        targets: targets,
        rollMode: mode,
        timestamp: Date.now()
    };

    messageStore[payload.id] = payload;

    if (isHost) {
        handleData(payload);
    } else if (conn && conn.open) {
        conn.send(payload);
        if (mode === 'blind' && !isHost) {
            let diceData = {...payload, result: "?? (Cegas)", sender: myName};
            addDiceMessage(diceData);
        } else if (!targets.includes(myPeerId) && mode !== 'blind') {
            let diceData = {...payload, sender: myName + (mode === 'gm' ? ' (Privado)' : '')};
            addDiceMessage(diceData);
        }
    } else {
        addDiceMessage(payload);
    }
}

function generateImageHTML(url, isUpload) {
    const downloadAttr = isUpload ? `download="imagem.png"` : 'target="_blank"';
    const downloadTitle = isUpload ? "Baixar Imagem" : "Abrir Original";

    return `
    <div class="image-wrapper relative group mt-2">
        <!-- Botões de Ação (Download e Ocultar) -->
        <div class="image-actions absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <a href="${url}" ${downloadAttr} class="bg-black/60 text-white p-1 rounded hover:bg-black/80 flex items-center justify-center" title="${downloadTitle}" onclick="event.stopPropagation()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
            <button class="bg-black/60 text-white p-1 rounded hover:bg-black/80 flex items-center justify-center" onclick="event.stopPropagation(); this.closest('.image-wrapper').classList.add('collapsed')" title="Ocultar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            </button>
        </div>

        <!-- Conteúdo da Imagem (Clique alterna visibilidade) -->
        <div class="image-content cursor-pointer" onclick="this.closest('.image-wrapper').classList.toggle('collapsed')" title="Clique para ocultar/exibir">
            <img src="${url}" class="max-w-full max-h-64 rounded border border-zinc-700/50 hover:opacity-90 transition-opacity" loading="lazy" alt="Imagem">
        </div>

        <!-- Placeholder (Visível quando oculto) -->
        <div class="collapsed-placeholder hidden text-xs text-zinc-500 text-center py-2 border border-dashed border-zinc-700 rounded cursor-pointer hover:bg-zinc-800 hover:text-zinc-300 transition-colors" onclick="this.parentElement.classList.remove('collapsed')">
            Imagem Oculta (Clique para ver)
        </div>
    </div>`;
}

function addChatMessage(msgData) {
    const div = document.createElement('div');
    renderChatMessageInto(div, msgData);
    chatMessages.appendChild(div);
    scrollToBottom();
}

// Função Atualizada: Aceita msgData completo para suportar ID e Delete
function addDiceMessage(msgData) {
    const div = document.createElement('div');
    renderDiceMessageInto(div, msgData);
    chatMessages.appendChild(div);
    scrollToBottom();
}

function addSystemMessage(text) {
    const div = document.createElement('div');
    div.className = "text-center text-zinc-500 text-xs italic py-1";
    div.innerText = text;
    chatMessages.appendChild(div);
    scrollToBottom();
}

btnSend.onclick = sendChat;
chatInput.onkeypress = (e) => { if(e.key === 'Enter') sendChat(); };

// Expose functions for inline HTML handlers
window.scrollToBottom = scrollToBottom;
window.addDieToSelectedZone = addDieToSelectedZone;
window.addGroupToSum = addGroupToSum;
window.selectZone = selectZone;
window.addModToSum = addModToSum;
window.importMacro = importMacro;
window.exportMacro = exportMacro;
window.deleteMacro = deleteMacro;
window.closeMacroEditor = closeMacroEditor;
window.saveMacro = saveMacro;
window.handleFileImport = handleFileImport;
window.rollDice = rollDice;
window.openMacroEditor = openMacroEditor;
window.rollMacro = rollMacro;
window.removeFromZone = removeFromZone;
window.cancelReply = cancelReply;
window.softDeleteMessage = softDeleteMessage;
window.undoDeleteMessage = undoDeleteMessage;
window.hardDeleteMessage = hardDeleteMessage;
window.initiateReply = initiateReply;
window.scrollToMessage = scrollToMessage;
