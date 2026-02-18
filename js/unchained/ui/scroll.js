import { App } from '../appState.js';
import { t } from '../i18n.js';

const { dom, state } = App;

export function bindScrollBehavior() {
    if (!dom.chatMessages) return;

    dom.chatMessages.addEventListener('scroll', () => {
        const distanceToBottom = dom.chatMessages.scrollHeight - dom.chatMessages.scrollTop - dom.chatMessages.clientHeight;

        if (distanceToBottom > 100) {
            state.userHasScrolledUp = true;
            dom.scrollDownBtn.classList.remove('hidden-btn');

            if (distanceToBottom < 150) dom.scrollDownBtn.classList.remove('has-new');
        } else {
            state.userHasScrolledUp = false;
            dom.scrollDownBtn.classList.add('hidden-btn');
            dom.scrollDownBtn.classList.remove('has-new');
        }
    });
}

export function scrollToBottom(force = false) {
    if (!dom.chatMessages) return;

    if (force || !state.userHasScrolledUp) {
        dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
        state.userHasScrolledUp = false;
        dom.scrollDownBtn.classList.add('hidden-btn');
        dom.scrollDownBtn.classList.remove('has-new');
    } else {
        dom.scrollDownBtn.classList.add('has-new');
    }
}

export function scrollToMessage(msgId) {
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

export function addSystemMessage(text) {
    const div = document.createElement('div');
    div.className = 'text-center text-zinc-500 text-xs italic py-1';
    div.innerText = text;
    dom.chatMessages.appendChild(div);
    scrollToBottom();
}
