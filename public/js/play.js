// ==============================
// AI Game Portal - play.js
// ==============================

(function () {
    const params = new URLSearchParams(window.location.search);
    const file = params.get('file');

    const gameFrame       = document.getElementById('game-frame');
    const frameLoading    = document.getElementById('frame-loading');
    const frameError      = document.getElementById('frame-error');
    const playTitle       = document.getElementById('play-title');

    const safeName = file ? file.replace(/[^a-zA-Z0-9_.\-]/g, '') : '';

    if (!safeName) {
        frameLoading.classList.add('hidden');
        frameError.classList.remove('hidden');
        return;
    }

    // ── Cargar iframe ──────────────────────────────────────
    function loadGame(bust) {
        frameLoading.classList.remove('hidden');
        gameFrame.src = '';
        setTimeout(() => {
            gameFrame.src = `/games/${safeName}` + (bust ? `?t=${Date.now()}` : '');
        }, 80);
    }

    gameFrame.addEventListener('load', () => {
        frameLoading.classList.add('hidden');
        try {
            const t = gameFrame.contentDocument?.title;
            if (t) {
                playTitle.textContent = '🎮 ' + t;
                document.title = t + ' | AI Game Portal';
            } else {
                playTitle.textContent = '🎮 Jugando...';
            }
        } catch { playTitle.textContent = '🎮 Jugando...'; }
    });

    gameFrame.addEventListener('error', () => {
        frameLoading.classList.add('hidden');
        frameError.classList.remove('hidden');
    });

    loadGame(false);

    // ── Botón REVERTIR permanente en header ────────────────
    const restoreHeaderBtn = document.getElementById('restore-header-btn');

    // Recuperar backup de la sesión (por si el usuario recarga la página)
    let lastBackupName = sessionStorage.getItem(`backup_${safeName}`) || null;

    function showRestoreBtn(backupName) {
        lastBackupName = backupName;
        sessionStorage.setItem(`backup_${safeName}`, backupName);
        restoreHeaderBtn.classList.remove('hidden');
    }

    function hideRestoreBtn() {
        lastBackupName = null;
        sessionStorage.removeItem(`backup_${safeName}`);
        restoreHeaderBtn.classList.add('hidden');
    }

    // Si había un backup guardado en sesión, mostrar el botón
    if (lastBackupName) restoreHeaderBtn.classList.remove('hidden');

    restoreHeaderBtn.addEventListener('click', async () => {
        if (!lastBackupName) return;
        const originalText = restoreHeaderBtn.innerHTML;
        restoreHeaderBtn.innerHTML = '<span>⏳</span><span>Revirtiendo...</span>';
        restoreHeaderBtn.disabled = true;

        try {
            const res = await fetch('/api/games/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: safeName, backupName: lastBackupName })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                restoreHeaderBtn.innerHTML = '<span>✅</span><span>Revertido</span>';
                hideRestoreBtn();
                setTimeout(() => loadGame(true), 700);
            } else {
                alert('No se pudo revertir: ' + (data.error || 'Error desconocido'));
                restoreHeaderBtn.innerHTML = originalText;
                restoreHeaderBtn.disabled = false;
            }
        } catch {
            alert('Error de conexión al revertir.');
            restoreHeaderBtn.innerHTML = originalText;
            restoreHeaderBtn.disabled = false;
        }
    });

    // ── Modal de edición ───────────────────────────────────
    const editOpenBtn     = document.getElementById('edit-open-btn');
    const editOverlay     = document.getElementById('edit-overlay');
    const editClose       = document.getElementById('edit-close');
    const editInstruction = document.getElementById('edit-instruction');
    const editSubmitBtn   = document.getElementById('edit-submit-btn');
    const editProcessing  = document.getElementById('edit-processing');
    const editSuccess     = document.getElementById('edit-success');
    const editError       = document.getElementById('edit-error');
    const editErrorMsg    = document.getElementById('edit-error-msg');
    const restoreOnErrorBtn = document.getElementById('restore-on-error-btn');
    const suggestionBtns  = document.querySelectorAll('.suggestion-btn');

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
        restoreOnErrorBtn.classList.add('hidden');
        suggestionBtns.forEach(b => b.classList.remove('selected'));
    }

    editOpenBtn.addEventListener('click', openEditModal);
    editClose.addEventListener('click', closeEditModal);
    editOverlay.addEventListener('click', (e) => {
        if (e.target === editOverlay) closeEditModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !editOverlay.classList.contains('hidden')) closeEditModal();
    });

    // Sugerencias rápidas
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            suggestionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            editInstruction.value = btn.dataset.text;
            editInstruction.focus();
        });
    });

    // ── Enviar edición ─────────────────────────────────────
    editSubmitBtn.addEventListener('click', async () => {
        const instruction = editInstruction.value.trim();
        if (!instruction) {
            editInstruction.focus();
            editInstruction.style.borderColor = 'rgba(239,68,68,0.6)';
            setTimeout(() => { editInstruction.style.borderColor = ''; }, 1500);
            return;
        }

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
                // ✅ Éxito: activar botón revertir en header, mostrar mensaje 1.5s y cerrar
                showRestoreBtn(data.backupName);
                editSuccess.classList.remove('hidden');
                setTimeout(() => {
                    closeEditModal();
                    loadGame(true); // recargar iframe con nueva versión
                }, 1500);
            } else {
                const errMsg = data.error || 'Error desconocido al editar el juego.';
                editErrorMsg.textContent = errMsg;
                editError.classList.remove('hidden');
                // Si hubo backup antes del fallo de IA, ofrecer revertir
                if (data.backupName) {
                    showRestoreBtn(data.backupName);
                    restoreOnErrorBtn.classList.remove('hidden');
                }
            }
        } catch {
            editProcessing.classList.add('hidden');
            editErrorMsg.textContent = 'Error de conexión con el servidor.';
            editError.classList.remove('hidden');
        }
    });

    // Revertir desde el modal de error
    restoreOnErrorBtn.addEventListener('click', async () => {
        if (!lastBackupName) return;
        restoreOnErrorBtn.textContent = 'Restaurando...';
        restoreOnErrorBtn.disabled = true;
        try {
            const res = await fetch('/api/games/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: safeName, backupName: lastBackupName })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                hideRestoreBtn();
                closeEditModal();
                loadGame(true);
            } else {
                alert('Error al revertir: ' + (data.error || 'Error desconocido'));
                restoreOnErrorBtn.textContent = '↩ Restaurar backup';
                restoreOnErrorBtn.disabled = false;
            }
        } catch {
            alert('Error de conexión al revertir.');
            restoreOnErrorBtn.textContent = '↩ Restaurar backup';
            restoreOnErrorBtn.disabled = false;
        }
    });

})();
