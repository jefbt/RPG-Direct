export function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function generateUUID() {
    return 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}

export function generateProfileId() {
    return 'prof-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}

export function safeJsonParse(text) {
    try { return JSON.parse(text); } catch { return null; }
}

export function downloadJson(filename, obj) {
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

export function normalizeSymbol(s) {
    return (s || '').trim();
}

export function generateRandomSymbol() {
    const symbols = [
        '⚔️', '🛡️', '🧙', '🧝',
        '🐉', '🦊', '🐺',
        '🔥', '❄️', '⚡',
        '�', '🎲'
    ];
    return randomFrom(symbols);
}

export function getFormattedTimestamp(ts) {
    const d = new Date(ts || Date.now());
    const pad = n => n.toString().padStart(2, '0');
    const ms = d.getMilliseconds().toString().padStart(3, '0').slice(0, 2);
    const match = d.toString().match(/\((.+)\)/);
    const tz = match ? match[1] : 'UTC';
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms} (${tz})`;
}
