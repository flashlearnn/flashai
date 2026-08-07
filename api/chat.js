export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { message, image } = req.body;
    const apiKey = process.env.GEMINI_API_ANAHTARI;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hata: Yanıt dönmedi, API anahtarını kontrol et.";
        return res.status(200).json({ text: aiText });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}