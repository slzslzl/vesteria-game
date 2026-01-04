// Используем старый добрый require, чтобы Vercel не ругался на типы модулей
// Нам не нужен node-fetch в новых версиях Node, но мы используем встроенный fetch

module.exports = async (req, res) => {
    // 1. Настройка заголовков (CORS), чтобы браузер не блокировал запрос
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Если это предварительный запрос браузера - сразу говорим "ОК"
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    // ПРОВЕРКА 1: Ключ на месте?
    if (!API_KEY) {
        console.error("Нет API ключа");
        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: JSON.stringify([{name: "ОШИБКА", description: "В Vercel не прописан GEMINI_API_KEY", level: 1, upgradable: false, maxLevel: 1}]) }] } }]
        });
    }

    try {
        // ПРОВЕРКА 2: Тело запроса пришло?
        const payload = req.body;
        if (!payload) {
             throw new Error("Тело запроса пустое");
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // ПРОВЕРКА 3: Ошибка от самого Google?
        if (data.error) {
            console.error("Ошибка Google:", data.error);
            // Возвращаем ошибку так, чтобы игра её показала как "навык"
            return res.status(200).json({
                candidates: [{ content: { parts: [{ text: JSON.stringify([{name: "ОШИБКА GOOGLE", description: data.error.message, level: 1, upgradable: false, maxLevel: 1}]) }] } }]
            });
        }

        // Всё ок, отдаем данные
        return res.status(200).json(data);

    } catch (error) {
        console.error("Критическая ошибка:", error);
        // Возвращаем ошибку в формате игры
        return res.status(200).json({
            candidates: [{ content: { parts: [{ text: JSON.stringify([{name: "КРИТИЧЕСКАЯ ОШИБКА", description: error.message, level: 1, upgradable: false, maxLevel: 1}]) }] } }]
        });
    }
};
