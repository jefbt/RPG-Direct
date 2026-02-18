import { App } from './appState.js';

const { constants, state, dom } = App;

export const I18N = {
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

export function mapBrowserLanguageToSupported(lang) {
    if (!lang || typeof lang !== 'string') return 'en';
    const normalized = lang.trim();
    const lower = normalized.toLowerCase();
    if (lower === 'pt-br' || lower === 'pt_br') return 'pt-BR';
    if (lower.startsWith('pt')) return 'pt-BR';
    if (lower.startsWith('es')) return 'es';
    if (lower.startsWith('en')) return 'en';
    return 'en';
}

export function detectInitialLanguage() {
    const saved = localStorage.getItem(constants.LANGUAGE_STORAGE_KEY);
    if (saved && I18N[saved]) return saved;
    const langs = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    for (const l of langs) {
        const mapped = mapBrowserLanguageToSupported(l);
        if (I18N[mapped]) return mapped;
    }
    return 'en';
}

export function t(key, vars) {
    const langPack = I18N[state.currentLanguage] || I18N.en;
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

export function applyI18nToDom() {
    document.documentElement.lang = state.currentLanguage;

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

export function setLanguage(lang, persist = true) {
    const mapped = mapBrowserLanguageToSupported(lang);
    state.currentLanguage = I18N[mapped] ? mapped : 'en';
    if (persist) localStorage.setItem(constants.LANGUAGE_STORAGE_KEY, state.currentLanguage);
    if (dom.languageSelect) dom.languageSelect.value = state.currentLanguage;
    applyI18nToDom();
}

export function bindLanguageSelect() {
    if (!dom.languageSelect) return;
    dom.languageSelect.addEventListener('change', () => {
        setLanguage(dom.languageSelect.value, true);
    });
}
