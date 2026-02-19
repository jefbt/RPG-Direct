import { App } from './appState.js';
import { t } from './i18n.js';
import { generateRandomSymbol, normalizeSymbol } from './utils.js';

const { dom, state } = App;

export function getMyBaseName() {
    return dom.nameInput.value.trim() || t('user.anonymous');
}

export function getMySymbol() {
    return normalizeSymbol(dom.symbolInput ? dom.symbolInput.value : '');
}

export function getMyDisplayPrefix() {
    const sym = getMySymbol();
    return sym ? `${sym} ` : '';
}

export function getMyDisplayName() {
    let name = `${getMyDisplayPrefix()}${getMyBaseName()}`;
    if (state.isHost) name += ' ★';
    return name;
}

export function ensureIdentityDefaults() {
    if (dom.nameInput && !dom.nameInput.value.trim()) {
        dom.nameInput.value = t('user.traveler') + ' ' + Math.floor(Math.random() * 100);
    }
    if (dom.symbolInput && !dom.symbolInput.value.trim()) {
        dom.symbolInput.value = generateRandomSymbol();
    }
}

export function loadIdentityFromStorage() {
    const savedName = localStorage.getItem('rpg_p2p_player_name');
    const savedSymbol = localStorage.getItem('rpg_p2p_player_symbol');

    if (dom.nameInput && savedName) dom.nameInput.value = savedName;
    if (dom.symbolInput && savedSymbol) dom.symbolInput.value = savedSymbol;
}

export function saveIdentityToStorage() {
    if (dom.nameInput) localStorage.setItem('rpg_p2p_player_name', getMyBaseName());
    if (dom.symbolInput) localStorage.setItem('rpg_p2p_player_symbol', getMySymbol());
}
