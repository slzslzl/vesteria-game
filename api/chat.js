export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;

  // Проверка ключа
  if (!API_KEY) {
    return res.status(500).json({
      candidates: [{ content: { parts: [{ text: "ОШИБКА: Ключ GEMINI_API_KEY не найден в Vercel!" }] } }]
    });
  }

  // Разрешаем только POST-запросы
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      candidates: [{ content: { parts: [{ text: `ОШИБКА: Неподдерживаемый метод ${req.method}. Используйте POST.` }] } }]
    });
  }

  // URL без вставки ключа в query; используем Authorization header
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    // Попытка прочитать тело как текст, потом как JSON — чтобы безопасно обработать любые ответы
    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch (parseErr) {
      data = null;
    }

    // Если ответ от Google не в 2xx — вернуть понятную ошибку в формате игры
    if (!response.ok) {
      const message = data?.error?.message || raw || response.statusText || `HTTP ${response.status}`;
      return res.status(200).json({
        candidates: [{ content: { parts: [{ text: `ОШИБКА ГУГЛА: ${message}` }] } }]
      });
    }

    // Успешный ответ: если это JSON — отдать его, иначе вернуть как текст в candidates
    if (data) {
      return res.status(200).json(data);
    } else {
      return res.status(200).json({
        candidates: [{ content: { parts: [{ text: raw || 'Пустой ответ от сервера генерации.' }] } }]
      });
    }
  } catch (err) {
    return res.status(500).json({
      candidates: [{ content: { parts: [{ text: `ОШИБКА СЕРВЕРА: ${err.message}` }] } }]
    });
  }
}
