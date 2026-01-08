export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Твой ключ OpenRouter, который ты скинул
  const OPENROUTER_API_KEY = "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";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat", // Используем DeepSeek V3 через OpenRouter
        "messages": req.body.messages,
        "temperature": 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", data);
      return res.status(response.status).json(data);
    }

    // Возвращаем ответ в формате, который ожидает твоя игра
    // Мы приводим его к структуре Gemini, чтобы не переделывать фронтенд
    const result = {
      candidates: [
        {
          content: {
            parts: [
              { text: data.choices[0].message.content }
            ]
          }
        }
      ]
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
