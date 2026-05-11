// ==============================
// AI Game Portal - play.js
// ==============================

(function () {
    const params = new URLSearchParams(window.location.search);
    const file = params.get('file');

    const gameFrame = document.getElementById('game-frame');
    const frameLoading = document.getElementById('frame-loading');
    const frameError = document.getElementById('frame-error');
    const playTitle = document.getElementById('play-title');

    if (!file) {
        frameLoading.classList.add('hidden');
        frameError.classList.remove('hidden');
        return;
    }

    // Sanitizar: solo permitir nombre de archivo sin slashes
    const safeName = file.replace(/[^a-zA-Z0-9_.\-]/g, '');
    if (!safeName) {
        frameLoading.classList.add('hidden');
        frameError.classList.remove('hidden');
        return;
    }

    // Extraer título del nombre de archivo para mostrarlo
    const titleFromFile = safeName.replace(/^game_\d+\.html$/, '').replace(/_/g, ' ').trim();
    playTitle.textContent = titleFromFile || '🎮 Jugando...';

    // Cargar el juego en el iframe
    const src = `/games/${safeName}`;
    gameFrame.src = src;

    gameFrame.addEventListener('load', () => {
        frameLoading.classList.add('hidden');
        // Intentar obtener el título del iframe si está disponible
        try {
            const iframeTitle = gameFrame.contentDocument?.title;
            if (iframeTitle) {
                playTitle.textContent = '🎮 ' + iframeTitle;
                document.title = iframeTitle + ' | AI Game Portal';
            }
        } catch (e) {
            // No se puede acceder al iframe (cross-origin sandbox)
        }
    });

    gameFrame.addEventListener('error', () => {
        frameLoading.classList.add('hidden');
        frameError.classList.remove('hidden');
    });
})();
