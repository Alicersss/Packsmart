
// Vercel Serverless Function: proxies to Google Gemini API (free tier)
// Get free API key at: https://aistudio.google.com/apikey
// Set GEMINI_API_KEY in Vercel Environment Variables

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: { message: 'GEMINI_API_KEY not configured' } });

  try {
    const { messages, tools } = req.body;
    const userMsg = messages?.[0]?.content || '';
    
    // Use Gemini with grounding (web search) if tools were requested
    const useGrounding = tools && tools.length > 0;
    
    const geminiBody = {
      contents: [{ parts: [{ text: userMsg }] }],
      generationConfig: { 
        temperature: 0.7, 
        maxOutputTokens: 4096,
        responseMimeType: "text/plain"
      }
    };

    if (useGrounding) {
      geminiBody.tools = [{ google_search: {} }];
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ error: { message: data.error.message } });
    }

    // Convert Gemini response to Anthropic-compatible format
    const text = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .filter(Boolean)
      .join('\n') || '';

    res.status(200).json({
      content: [{ type: 'text', text }],
      model: 'gemini-2.0-flash',
      stop_reason: 'end_turn'
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
}

