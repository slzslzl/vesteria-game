export default async function handler(req, res) {
  const API_KEY = process.env.GEMINI_API_KEY;
  
  // Проверка ключа
  if (!API_KEY) {
    return res.status(500).json({ 
        candidates: [{ content: { parts: [{ text: "ОШИБКА: Ключ GEMINI_API_KEY не найден в Vercel!" }] } }] 
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    if (data.error) {
      // Если Google ругается, мы отправляем текст ошибки прямо в игру
      return res.status(200).json({ 
        candidates: [{ content: { parts: [{ text: `ОШИБКА ГУГЛА: ${data.error.message}` }] } }] 
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ 
      candidates: [{ content: { parts: [{ text: `ОШИБКА СЕРВЕРА: ${err.message}` }] } }] 
    });
  }
}
