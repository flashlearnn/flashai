export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST isteği kabul edilir.' });
    }

    const { message, image } = req.body;
    if (!message && !image) {
        return res.status(400).json({ error: 'Mesaj veya görsel boş olamaz.' });
    }

    const apiKey = process.env.GEMINI_API_ANAHTARI;
    if (!apiKey) {
        return res.status(500).json({ error: 'API anahtarı sunucuda tanımlanmamış!' });
    }

    try {
        let parts = [];
        
        // Eğer resim yüklendiyse base64 formatını API'nin isteği formata çevir
        if (image) {
            const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                parts.push({
                    inline_data: {
                        mime_type: matches[1],
                        data: matches[2]
                    }
                });
            }
        }

        // Metin varsa ekle
        parts.push({ text: message || "Bu görseli analiz et ve açıkla." });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: parts }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Google API Hatası:", data);
            return res.status(500).json({ error: data.error?.message || 'Google API yanıt vermedi.' });
        }

        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Yanıt alınamadı.";

        return res.status(200).json({ text: aiText });
    } catch (error) {
        console.error("Sunucu Hatası:", error);
        return res.status(500).json({ error: error.message });
    }
}