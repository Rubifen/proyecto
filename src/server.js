const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const fs = require('fs');

// GET /api/games
app.get('/api/games', (req, res) => {
    db.all('SELECT * FROM games ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ games: rows });
    });
});

// POST /api/games (Stub)
app.post('/api/games', (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const filename = `game_${Date.now()}.html`;
    const filepath = path.join(__dirname, '../public/games', filename);
    const fakeHtml = `<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>Hola Mundo: ${title}</h1></body></html>`;

    fs.writeFile(filepath, fakeHtml, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error creating game file' });
        }

        const prompt_used = 'Stub prompt';
        db.run('INSERT INTO games (title, filename, prompt_used) VALUES (?, ?, ?)', [title, filename, prompt_used], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error saving to database' });
            }
            res.json({
                message: 'Game created successfully',
                game: {
                    id: this.lastID,
                    title,
                    filename,
                    prompt_used
                }
            });
        });
    });
});

// =====================================================================
// FASE 7: SISTEMA DE PROMPT Y ESTRUCTURA PARA IA REAL
// =====================================================================

const SYSTEM_PROMPT = `Eres un generador de videojuegos HTML5 experto.
Tu única tarea es generar código HTML5 completo, válido y funcional para un videojuego interactivo.

REGLAS ESTRICTAS:
1. Devuelve ÚNICAMENTE el código HTML, sin explicaciones, sin comentarios fuera del código, sin bloques de markdown (\`\`\`html), sin texto adicional.
2. El archivo debe ser completamente autocontenido: todo el CSS debe estar dentro de etiquetas <style> y todo el JavaScript dentro de etiquetas <script>.
3. El juego debe ser completamente jugable e interactivo en el navegador.
4. Usa solo APIs web estándar (Canvas, DOM, Web Audio API si es necesario).
5. El HTML debe empezar con <!DOCTYPE html> y terminar con </html>.
6. Asegúrate de que el juego tenga: pantalla de inicio, mecánicas de juego funcionales, y pantalla de game over o victoria.
7. Optimiza el código para que funcione en un iframe.`;

/**
 * Llama a la API de IA para generar código HTML de un juego.
 * @param {string} userPrompt - El prompt del usuario describiendo el juego
 * @returns {Promise<string>} - Código HTML del juego generado
 *
 * PARA ACTIVAR: descomenta el bloque que corresponda a tu proveedor.
 * Recuerda añadir la API key en el archivo .env (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)
 */
async function callAI(userPrompt) {
    // --- OPCIÓN 1: OpenAI (GPT-4o) ---
    // const { OpenAI } = require('openai');
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const response = await openai.chat.completions.create({
    //     model: 'gpt-4o',
    //     messages: [
    //         { role: 'system', content: SYSTEM_PROMPT },
    //         { role: 'user', content: userPrompt }
    //     ],
    //     max_tokens: 4096,
    //     temperature: 0.8
    // });
    // return response.choices[0].message.content.trim();

    // --- OPCIÓN 2: Anthropic Claude ---
    // const Anthropic = require('@anthropic-ai/sdk');
    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // const message = await client.messages.create({
    //     model: 'claude-opus-4-5',
    //     max_tokens: 4096,
    //     system: SYSTEM_PROMPT,
    //     messages: [{ role: 'user', content: userPrompt }]
    // });
    // return message.content[0].text.trim();

    // --- OPCIÓN 3: Google Gemini ---
    // const { GoogleGenerativeAI } = require('@google/generative-ai');
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro', systemInstruction: SYSTEM_PROMPT });
    // const result = await model.generateContent(userPrompt);
    // return result.response.text().trim();

    // --- SIMULACIÓN (activa hasta que configures una API real) ---
    return null; // null = usar HTML simulado
}

// POST /api/generate
app.post('/api/generate', async (req, res) => {
    const { title, prompt } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const filename = `game_${Date.now()}.html`;
    const filepath = path.join(__dirname, '../public/games', filename);

    const userPrompt = `Crea un juego HTML5 completo con el siguiente título: "${title}". ${prompt || ''}`;

    let htmlContent;

    try {
        // Intentar llamada a IA real
        const aiHtml = await callAI(userPrompt);

        if (aiHtml) {
            // IA respondió: limpiar markdown si la IA lo añadió por error
            htmlContent = aiHtml
                .replace(/^```html\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
        } else {
            // Modo simulación (sin API configurada)
            htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0f1a 100%);
      color: #f0f0ff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 24px;
      padding: 40px;
      text-align: center;
    }
    h1 { font-size: 2.5rem; color: #a855f7; text-shadow: 0 0 30px rgba(168,85,247,0.5); }
    .info {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(168,85,247,0.3);
      border-radius: 16px;
      padding: 24px 32px;
      max-width: 600px;
      line-height: 1.8;
      color: #a0a0c0;
    }
    .prompt-label { color: #06b6d4; font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      color: white;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <h1>🎮 ${title}</h1>
  <div class="info">
    <div class="prompt-label">Prompt utilizado</div>
    <p>${prompt || 'Sin prompt definido.'}</p>
    <span class="badge">⚡ Simulación activa — configura una API de IA en src/server.js</span>
  </div>
</body>
</html>`;
        }
    } catch (aiErr) {
        console.error('Error llamando a la IA:', aiErr.message);
        return res.status(500).json({ error: 'Error al contactar con la API de IA: ' + aiErr.message });
    }

    fs.writeFile(filepath, htmlContent, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al crear el archivo del juego' });
        }

        db.run(
            'INSERT INTO games (title, filename, prompt_used) VALUES (?, ?, ?)',
            [title, filename, prompt || ''],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Error al guardar en la base de datos' });
                }
                res.json({
                    success: true,
                    game: { id: this.lastID, title, filename }
                });
            }
        );
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
