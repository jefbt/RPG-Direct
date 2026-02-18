import { App } from './appState.js';
import { bindLanguageSelect, detectInitialLanguage, setLanguage } from './i18n.js';
import { bindScrollBehavior, scrollToBottom, scrollToMessage, addSystemMessage } from './ui/scroll.js';
import { updateRecipientsUI, initiateReply, cancelReply } from './ui/recipients.js';
import { bindChatInput, sendChat, sendImage } from './chat/actions.js';
import { softDeleteMessage, undoDeleteMessage, hardDeleteMessage } from './chat/delete.js';
import { bindDiceToggle, updateDiceVisibility, rollDice } from './dice/dice.js';
import {
    loadMacros,
    renderMacroButtons,
    openMacroEditor,
    closeMacroEditor,
    saveMacro,
    deleteMacro,
    exportMacro,
    importMacro,
    handleFileImport,
    addDieToSelectedZone,
    addGroupToSum,
    selectZone,
    addModToSum,
    rollMacro,
    removeFromZone
} from './dice/macros.js';
import { ensureIdentityDefaults, loadIdentityFromStorage, saveIdentityToStorage } from './identity.js';
import { initPeer, bindIdentityChangeHandlers } from './peer/peer.js';

const { dom, constants } = App;

function bindAppVersion() {
    const versionEl = document.getElementById('app-version');
    if (versionEl) versionEl.innerText = `v${constants.APP_VERSION}`;
}

function loadSavedRemoteId() {
    const savedRemoteId = localStorage.getItem('rpg_p2p_remote_id');
    if (savedRemoteId && dom.remoteIdInput) dom.remoteIdInput.value = savedRemoteId;
}

function exposeWindowApi() {
    window.scrollToBottom = scrollToBottom;
    window.scrollToMessage = scrollToMessage;

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
    window.initiateReply = initiateReply;

    window.softDeleteMessage = softDeleteMessage;
    window.undoDeleteMessage = undoDeleteMessage;
    window.hardDeleteMessage = hardDeleteMessage;

    window.sendChat = sendChat;
    window.sendImage = sendImage;

    window.addSystemMessage = addSystemMessage;
    window.updateRecipientsUI = updateRecipientsUI;
    window.renderMacroButtons = renderMacroButtons;
}

function init() {
    setLanguage(detectInitialLanguage(), true);
    bindLanguageSelect();

    loadIdentityFromStorage();
    ensureIdentityDefaults();
    saveIdentityToStorage();

    bindAppVersion();

    bindScrollBehavior();
    bindChatInput();

    bindDiceToggle();
    updateDiceVisibility();

    loadMacros();
    renderMacroButtons();

    initPeer();
    bindIdentityChangeHandlers();

    loadSavedRemoteId();
}

exposeWindowApi();

window.addEventListener('load', () => {
    init();
});
