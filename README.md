# PackSmart – AI Travel Packing Optimizer
Built by Alice Lu | Powered by Claude API + Web Search

## 🚀 Deploy to Vercel (5 minutes)

### Step 1: Get an Anthropic API Key
1. Go to https://console.anthropic.com
2. Create an API key
3. Add $5 credit (minimum) — the app uses ~$0.02 per generation

### Step 2: Push to GitHub
1. Create a new repo on GitHub (e.g., `packsmart`)
2. Upload all files from this folder to the repo

Or via terminal:
```bash
cd packsmart-deploy
git init
git add .
git commit -m "PackSmart v1"
git remote add origin https://github.com/YOUR_USERNAME/packsmart.git
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to https://vercel.com (sign up with GitHub)
2. Click "Add New Project"
3. Import your `packsmart` repo
4. **IMPORTANT**: Add Environment Variable:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key from Step 1
5. Click "Deploy"
6. Done! Your URL will be something like `packsmart-xxx.vercel.app`

### Step 4: Custom Domain (Optional)
In Vercel project settings → Domains → Add `packsmart.yourdomain.com`

### Step 5: QR Code for Interview
1. Go to https://qr.io or any QR generator
2. Paste your Vercel URL
3. Download the QR code
4. Print it on your CV or have it on your phone

## 📱 Interview Demo Strategy

**Before the interview:**
- Generate a Casablanca packing list as a demo (takes 15 seconds)
- Have the URL ready on your phone AND laptop
- Test that it works on the venue's WiFi

**During the interview (30 seconds):**
1. "I built this smart travel packing tool — let me show you"
2. Open on phone/laptop → show pre-generated Casablanca result
3. Point out: weather, risk assessment, payment advisory, bag optimization
4. Key line: "It's the same constrained optimization logic I used at UCL Innovation Lab — just with airline luggage rules instead of warehouse capacity"

**If they ask technical questions:**
- "It calls Claude's API with web search to get real-time destination data"
- "The luggage allocation is a bin-packing problem with airline-specific constraints"
- "I went from theoretical knowledge to building something that solves a real problem — exactly the shift I described in my application"
