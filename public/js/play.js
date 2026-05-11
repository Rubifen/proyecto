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

    // Sanitizar nombre de archivo
    const safeName = file ? file.replace(/[^a-zA-Z0-9_.\-]/g, '') : '';

    if (!safeName) {
        frameLoading.classList.add('hidden');
        frameError.classList.remove('hidden');
        return;
    }

    // Cargar el juego en el iframe
    gameFrame.src = `/games/${safeName}`;

    gameFrame.addEventListener('load', () => {
        frameLoading.classList.add('hidden');
        try {
            const iframeTitle = gameFrame.contentDocument?.title;
            if (iframeTitle) {
                playTitle.textContent = '🎮 ' + iframeTitle;
                document.title = iframeTitle + ' | AI Game Portal';
            } else {
                playTitle.textContent = '🎮 ' + safeName.replace(/^game_\d+\.html$/, 'Jugando...');
            }
        } catch (e) {
            playTitle.textContent = '🎮 Jugando...';
        }
    });

    gameFrame.addEventListener('error', () => {
        frameLoading.classList.add('hidden');
        frameError.classList.remove('hidden');
    });

    // =============================================
    // EDITOR DE JUEGOS CON IA
    // =============================================

    const editOpenBtn  = document.getElementById('edit-open-btn');
    const editOverlay  = document.getElementById('edit-overlay');
    const editClose    = document.getElementById('edit-close');
    const editInstruction = document.getElementById('edit-instruction');
    const editSubmitBtn   = document.getElementById('edit-submit-btn');
    const editProcessing  = document.getElementById('edit-processing');
    const editSuccess     = document.getElementById('edit-success');
    const editError       = document.getElementById('edit-error');
    const editErrorMsg    = document.getElementById('edit-error-msg');
    const reloadGameBtn   = document.getElementById('reload-game-btn');
    const restoreBackupBtn = document.getElementById('restore-backup-btn');
    const restoreOnErrorBtn = document.getElementById('restore-on-error-btn');
    const suggestionBtns  = document.querySelectorAll('.suggestion-btn');

    let lastBackupName = null; // guarda el nombre del backup más reciente

    // --- Abrir / cerrar modal ---
    function openEditModal() {
        editOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        resetEditModal();
        editInstruction.focus();
    }

    function closeEditModal() {
        editOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function resetEditModal() {
        editInstruction.value = '';
        editProcessing.classList.add('hidden');
        editSuccess.classList.add('hidden');
        editError.classList.add('hidden');
        editSubmitBtn.classList.remove('hidden');
        editSubmitBtn.disabled = false;
        suggestionBtns.forEach(b => b.classList.remove('selected'));
    }

    editOpenBtn.addEventListener('click', openEditModal);
    editClose.addEventListener('click', closeEditModal);
    editOverlay.addEventListener('click', (e) => {
        if (e.target === editOverlay) closeEditModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !editOverlay.classList.contains('hidden')) {
            closeEditModal();
        }
    });

    // --- Sugerencias rápidas ---
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            suggestionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            editInstruction.value = btn.dataset.text;
            editInstruction.focus();
        });
    });

    // --- Enviar edición a la IA ---
    editSubmitBtn.addEventListener('click', async () => {
        const instruction = editInstruction.value.trim();
        if (!instruction) {
            editInstruction.focus();
            editInstruction.style.borderColor = 'rgba(239,68,68,0.6)';
            setTimeout(() => { editInstruction.style.borderColor = ''; }, 1500);
            return;
        }

        // Mostrar estado de procesamiento
        editSubmitBtn.classList.add('hidden');
        editProcessing.classList.remove('hidden');
        editSuccess.classList.add('hidden');
        editError.classList.add('hidden');

        try {
            const res = await fetch('/api/games/edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: safeName, instruction })
            });

            const data = await res.json();

            editProcessing.classList.add('hidden');

            if (res.ok && data.success) {
                lastBackupName = data.backupName;
                editSuccess.classList.remove('hidden');
            } else {
                const errMsg = data.error || 'Error desconocido al editar el juego.';
                editErrorMsg.textContent = errMsg;
                editError.classList.remove('hidden');
                // Si hay backup disponible (la IA falló después de hacer backup), mostrar botón de restaurar
                if (data.backupName) {
                    lastBackupName = data.backupName;
                    restoreOnErrorBtn.classList.remove('hidden');
                }
            }
        } catch (err) {
            editProcessing.classList.add('hidden');
            editErrorMsg.textContent = 'Error de conexión con el servidor.';
            editError.classList.remove('hidden');
        }
    });

    // --- Recargar juego tras edición ---
    reloadGameBtn.addEventListener('click', () => {
        closeEditModal();
        // Forzar recarga del iframe
        frameLoading.classList.remove('hidden');
        gameFrame.src = '';
        setTimeout(() => {
            gameFrame.src = `/games/${safeName}?t=${Date.now()}`;
        }, 100);
    });

    // --- Restaurar backup (desde éxito) ---
    restoreBackupBtn.addEventListener('click', () => restoreBackup(false));
    // --- Restaurar backup (desde error) ---
    restoreOnErrorBtn.addEventListener('click', () => restoreBackup(true));

    async function restoreBackup(reloadAfter) {
        if (!lastBackupName) {
            alert('No hay backup disponible para restaurar.');
            return;
        }

        const btn = reloadAfter ? restoreOnErrorBtn : restoreBackupBtn;
        const originalText = btn.textContent;
        btn.textContent = 'Restaurando...';
        btn.disabled = true;

        try {
            const res = await fetch('/api/games/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: safeName, backupName: lastBackupName })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                if (reloadAfter) {
                    closeEditModal();
                    frameLoading.classList.remove('hidden');
                    gameFrame.src = '';
                    setTimeout(() => { gameFrame.src = `/games/${safeName}?t=${Date.now()}`; }, 100);
                } else {
                    // Indicar éxito y recargar también
                    btn.textContent = '✅ Restaurado';
                    setTimeout(() => {
                        closeEditModal();
                        frameLoading.classList.remove('hidden');
                        gameFrame.src = '';
                        setTimeout(() => { gameFrame.src = `/games/${safeName}?t=${Date.now()}`; }, 100);
                    }, 800);
                }
            } else {
                alert('No se pudo restaurar el backup: ' + (data.error || 'Error desconocido'));
                btn.textContent = originalText;
                btn.disabled = false;
            }
        } catch (err) {
            alert('Error de conexión al restaurar el backup.');
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

})();
