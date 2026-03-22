export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  var apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: { message: 'API key not set' } });
  try {
    var msg = req.body.messages && req.body.messages[0] ? req.body.messages[0].content : '';
    var useSearch = req.body.tools && req.body.tools.length > 0;
    var gb = { contents: [{ parts: [{ text: msg }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: "application/json" } };
    if (useSearch) gb.tools = [{ google_search: {} }];
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
    var response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gb) });
    var data = await response.json();
    if (data.error) return res.status(400).json({ error: { message: data.error.message } });
    var text = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      text = data.candidates[0].content.parts.map(function(p) { return p.text || ''; }).filter(Boolean).join('');
    }
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    res.status(200).json({ content: [{ type: 'text', text: text }] });
  } catch (error) { res.status(500).json({ error: { message: error.message } }); }
}
