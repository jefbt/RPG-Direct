# RPG-Direct-Starter


## Overview

RPG Direct Starter is a **static** (no backend) browser app to run a lightweight tabletop RPG session online using **peer-to-peer (P2P)** connections.

It provides:

- **Real-time chat** (host + players)
- **Dice rolling** with multiple visibility modes
- **Macros** (save common rolls/actions)
- **Image sharing** (file upload and paste)

The UI is built with **Tailwind (CDN)** and custom CSS, and networking is powered by **PeerJS**.

## Tech Stack

- **HTML/CSS/JavaScript** (vanilla)
- **TailwindCSS** via CDN
- **PeerJS** via CDN
- **LocalStorage** for some persisted data (macros, host id/history/profiles)

## Getting Started

### Requirements

- A modern browser (Chrome, Edge, Firefox)
- Internet access (PeerJS uses a public signaling server by default)

### Run locally

Because this is a static project, you can run it in any of these ways:

- **Option A (recommended):** use a local static server (e.g. VS Code “Live Server”)
- **Option B:** open `index.html` directly in your browser

Notes:

- Some browsers restrict certain features when opening a file directly (`file://`). If you hit issues, use a local server.

## How to Use

### Host / GM flow

- Open the app.
- Set your **symbol** and **nickname**.
- Your **ID** appears in the header (`ID: ...`). Click it to copy.
- Share this ID with your players.

As the host, you can also:

- Export / import chat history
- Clear chat

### Player flow

- Open the app.
- Set your **symbol** and **nickname**.
- Paste the GM’s ID into **“ID do Mestre”** and click **“Entrar”**.

### Chat recipients and whispers

Use the **“Chat Para:”** recipients to target who receives your message.

- If you include **All**, everyone receives it.
- Otherwise it is treated as a targeted message.

### Dice rolling

Use the dice buttons (D4, D6, D8, D10, D12, D20, D100).

Roll visibility is controlled by the mode selector:

- **Open:** everyone sees
- **GM:** only the GM sees
- **Blind:** hidden roll (for secret checks)
- **Group / Self:** session-specific visibility behaviors

### Macros

- Click the **“+”** button in the dice bar to open the Macro Editor.
- Build a macro and save it.
- Macros are stored in **LocalStorage**.

### Images

- Use the image button to upload
- Or paste images into the input

## Persistence / Storage

This project uses browser **LocalStorage** for convenience.

Examples:

- Host ID (so you can re-open and keep the same ID)
- Host chat history and player profiles
- Saved macros

If you want to reset everything, clear the site data for the page in your browser.

## Project Structure

- `index.html` — main UI and layout
- `css/unchained.css` — custom styles
- `js/unchained.js` — application logic (PeerJS, chat, dice, macros, storage)

## Customization

- **Branding/text:** update `index.html`
- **Styling:** edit `css/unchained.css`
- **Behavior/features:** edit `js/unchained.js`

If you change element IDs/classes in `index.html`, make sure they still match the selectors used in `js/unchained.js`.

## Deployment

This is a static site. You can deploy it to:

- GitHub Pages
- Netlify
- Vercel
- Any static hosting

Just upload the repository as-is.

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

You can:

- Use and modify the code
- Share copies
- Run your own hosted instance

If you distribute copies (for example, a downloadable bundle), GPL-3.0 requires that you keep the license notice and provide the corresponding source code under the same license.

- License text: see `LICENSE`
- Source code: https://github.com/jefbt/RPG-Direct
