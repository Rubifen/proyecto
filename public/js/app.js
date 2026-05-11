// ==============================
// AI Game Portal - app.js
// ==============================

const GAME_EMOJIS = ['🎮', '🕹️', '🎯', '🎲', '🧩', '🏆', '⚔️', '🚀', '🐉', '🌟', '💣', '🎪', '🦊', '🤖', '🧙', '🏎️', '🎵', '🌈', '🔮', '💎'];

function getRandomEmoji() {
    return GAME_EMOJIS[Math.floor(Math.random() * GAME_EMOJIS.length)];
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// --------- Renderizar el grid ---------
async function loadGames() {
    try {
        const res = await fetch('/api/games');
        const data = await res.json();
        const grid = document.getElementById('games-grid');
        const emptyState = document.getElementById('empty-state');
        grid.innerHTML = '';

        if (!data.games || data.games.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        data.games.forEach(game => {
            const emoji = getRandomEmoji();
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.filename = game.filename;
            card.innerHTML = `
                <span class="game-card-emoji">${emoji}</span>
                <span class="game-card-title">${escapeHtml(game.title)}</span>
                <span class="game-card-date">${formatDate(game.created_at)}</span>
            `;
            card.addEventListener('click', () => {
                window.location.href = `/play.html?file=${encodeURIComponent(game.filename)}`;
            });
            grid.appendChild(card);
        });
    } catch (err) {
        console.error('Error cargando juegos:', err);
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// --------- Modal ---------
const createBtn = document.getElementById('create-btn');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const btnModeSimple = document.getElementById('btn-mode-simple');
const btnModeAdvanced = document.getElementById('btn-mode-advanced');
const formSimple = document.getElementById('form-simple');
const formAdvanced = document.getElementById('form-advanced');
const generatingState = document.getElementById('generating-state');

function openModal() {
    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    resetModal();
}

function resetModal() {
    formSimple.reset();
    formAdvanced.reset();
    formSimple.classList.remove('hidden');
    formAdvanced.classList.add('hidden');
    generatingState.classList.add('hidden');
    btnModeSimple.classList.add('active');
    btnModeAdvanced.classList.remove('active');
}

createBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// --------- Mode selector ---------
btnModeSimple.addEventListener('click', () => {
    btnModeSimple.classList.add('active');
    btnModeAdvanced.classList.remove('active');
    formSimple.classList.remove('hidden');
    formAdvanced.classList.add('hidden');
});

btnModeAdvanced.addEventListener('click', () => {
    btnModeAdvanced.classList.add('active');
    btnModeSimple.classList.remove('active');
    formAdvanced.classList.remove('hidden');
    formSimple.classList.add('hidden');
});

// --------- Submit (Fase 5) ---------
async function handleGenerate(e, isAdvanced) {
    e.preventDefault();

    let title, prompt;

    if (isAdvanced) {
        title = document.getElementById('input-title-advanced').value.trim();
        prompt = document.getElementById('input-prompt').value.trim();
    } else {
        title = document.getElementById('input-title-simple').value.trim();
        const theme = document.getElementById('input-theme').value.trim();
        const gametype = document.getElementById('input-gametype').value;
        const colors = document.getElementById('input-colors').value.trim();
        prompt = `Temática: ${theme || 'libre'}. Tipo: ${gametype || 'libre'}. Estilo visual: ${colors || 'libre'}.`;
    }

    if (!title) return;

    // Mostrar spinner
    formSimple.classList.add('hidden');
    formAdvanced.classList.add('hidden');
    generatingState.classList.remove('hidden');

    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, prompt })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            closeModal();
            await loadGames();
        } else {
            alert('Error al generar el juego: ' + (data.error || 'Error desconocido'));
            resetModal();
        }
    } catch (err) {
        alert('Error de conexión al generar el juego.');
        resetModal();
    }
}

formSimple.addEventListener('submit', (e) => handleGenerate(e, false));
formAdvanced.addEventListener('submit', (e) => handleGenerate(e, true));

// --------- Init ---------
loadGames();
