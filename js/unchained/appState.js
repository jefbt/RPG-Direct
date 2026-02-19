const APP_VERSION = '0.21.0';

export const App = (() => {
    const existing = window.App;
    if (existing) return existing;

    const dom = {
        peerIdDisplay: document.getElementById('peer-id'),
        myIdBox: document.getElementById('my-id-display'),
        remoteIdInput: document.getElementById('remote-id'),
        btnConnect: document.getElementById('btn-connect'),
        chatInput: document.getElementById('chat-input'),
        btnSend: document.getElementById('btn-send'),
        chatMessages: document.getElementById('chat-messages'),
        statusDot: document.getElementById('status-dot'),
        nameInput: document.getElementById('player-name'),
        symbolInput: document.getElementById('player-symbol'),
        languageSelect: document.getElementById('language-select'),
        recipientsContainer: document.getElementById('recipients-container'),
        groupToggle: document.getElementById('group-toggle'),
        replyContextBar: document.getElementById('reply-context-bar'),
        replyTargetName: document.getElementById('reply-target-name'),
        replyTargetMsg: document.getElementById('reply-target-msg'),
        imageInput: document.getElementById('image-input'),
        btnResetId: document.getElementById('btn-reset-id'),
        scrollDownBtn: document.getElementById('scroll-down-btn'),
        toggleDiceBtn: document.getElementById('toggle-dice-btn'),
        hostChatControls: document.getElementById('host-chat-controls'),
        btnExportChat: document.getElementById('btn-export-chat'),
        btnImportChat: document.getElementById('btn-import-chat'),
        btnClearChat: document.getElementById('btn-clear-chat'),
        chatImportFile: document.getElementById('chat-import-file'),
        macroEditor: document.getElementById('macro-editor'),
        macrosContainer: document.getElementById('macros-container'),
        zoneKeep: document.getElementById('zone-keep'),
        zoneThreshold: document.getElementById('zone-threshold'),
        zoneSum: document.getElementById('zone-sum'),
        body: document.body
    };

    const constants = {
        APP_VERSION,
        HOST_CHAT_STORAGE_KEY: 'rpg_p2p_host_chat_history_v1',
        HOST_PROFILES_STORAGE_KEY: 'rpg_p2p_host_player_profiles_v1',
        LOCAL_PROFILE_ID_KEY: 'rpg_p2p_profile_id_v1',
        LANGUAGE_STORAGE_KEY: 'rpg_p2p_language_v1'
    };

    const state = {
        peer: null,
        myPeerId: null,
        connections: [],
        conn: null,
        isHost: false,
        isJoiningAsPlayer: false,
        knownPlayers: [],
        replyingTo: null,
        messageStore: {},
        handleData: null,
        currentLanguage: 'en',
        isRestoringHistory: false,
        hostChatHistory: [],
        hostPlayerProfiles: [],
        hasSentJoin: false,
        userHasScrolledUp: false,
        showStandardDice: true,
        macros: [],
        editingMacroId: null,
        selectedZone: 'sum',
        editorState: {
            name: '',
            icon: '⚔️',
            keep: [],
            threshold: [],
            sum: []
        }
    };

    const app = { dom, state, constants };
    window.App = app;
    window.APP_VERSION = APP_VERSION;
    return app;
})();
