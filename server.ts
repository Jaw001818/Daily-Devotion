import express from 'express';
import path from 'path';
import fs from 'fs';
import webpush from 'web-push';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// ==========================================
// 1. VAPID KEYS SETUP FOR REAL WEB PUSH
// ==========================================
interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

let vapidKeys: VapidKeys;
const VAPID_FILE = path.resolve('.vapid-keys.json');

try {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };
  } else if (fs.existsSync(VAPID_FILE)) {
    vapidKeys = JSON.parse(fs.readFileSync(VAPID_FILE, 'utf-8'));
  } else {
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(VAPID_FILE, JSON.stringify(vapidKeys, null, 2));
    console.log('[WebPush] Generated new VAPID keys and saved to .vapid-keys.json');
  }

  webpush.setVapidDetails(
    'mailto:support@dailybibledevotion.app',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  console.log('[WebPush] VAPID configured successfully.');
} catch (err) {
  console.error('[WebPush] Error configuring VAPID keys:', err);
  vapidKeys = webpush.generateVAPIDKeys();
}

// In-memory subscription storage (with fallback persistence)
interface StoredSubscription {
  id: string;
  subscription: webpush.PushSubscription;
  preferences: {
    time: string; // HH:mm
    reminderType: 'both' | 'devotion' | 'verse';
    timezone: string;
  };
  createdAt: string;
}

const subscriptions = new Map<string, StoredSubscription>();

// ==========================================
// 2. WEB PUSH REST API ENDPOINTS
// ==========================================

// GET VAPID Public Key for client subscription
app.get('/api/push/vapid-public-key', (_req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

// POST Subscribe client device
app.post('/api/push/subscribe', (req, res) => {
  const { subscription, preferences } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Valid subscription object is required.' });
  }

  const id = subscription.endpoint;
  const entry: StoredSubscription = {
    id,
    subscription,
    preferences: {
      time: preferences?.time || '07:00',
      reminderType: preferences?.reminderType || 'both',
      timezone: preferences?.timezone || 'Asia/Manila',
    },
    createdAt: new Date().toISOString(),
  };

  subscriptions.set(id, entry);
  console.log(`[WebPush] Subscribed device. Total active: ${subscriptions.size}`);
  res.json({ success: true, count: subscriptions.size });
});

// POST Send Immediate Test Web Push
app.post('/api/push/send-test', async (req, res) => {
  const { subscription } = req.body;
  if (!subscription) {
    return res.status(400).json({ error: 'Subscription is required for test push.' });
  }

  const payload = JSON.stringify({
    title: 'Daily Bible Devotion — Subok na Abiso',
    body: 'Banal na Paalala: "Ang Diyos ang ating kanlungan at lakas..." (Mga Awit 46:1). Aktibo na ang iyong daily push reminders!',
    url: '/',
    tag: 'test-push-notification',
  });

  try {
    await webpush.sendNotification(subscription, payload);
    console.log('[WebPush] Test notification delivered successfully.');
    res.json({ success: true, message: 'Test notification delivered.' });
  } catch (err: unknown) {
    console.error('[WebPush] Error sending test notification:', err);
    const statusCode = (err as { statusCode?: number })?.statusCode || 500;
    res.status(statusCode).json({ error: 'Failed to deliver push notification.' });
  }
});

// ==========================================
// 3. BACKGROUND CRON SCHEDULER (Every Minute)
// ==========================================
setInterval(async () => {
  if (subscriptions.size === 0) return;

  // Compute current Manila time in HH:mm
  let manilaTimeStr = '';
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    manilaTimeStr = formatter.format(new Date());
  } catch {
    const now = new Date();
    manilaTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  const sampleTitles = [
    'Hindi Ka Nahuhuli, Nagmamadali Ka Lang',
    'Kapag Takot Ka, Tumingin Ka kay Jesus',
    'Kahit Malakas ang Hangin, Kumapit Ka sa Pangako',
    'Hindi Pa Tapos ang Diyos sa Buhay Mo',
    'Kapag Tahimik ang Diyos, Matuto Kang Magtiwala',
  ];

  for (const [id, entry] of subscriptions.entries()) {
    if (entry.preferences.time === manilaTimeStr) {
      const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
      const payload = JSON.stringify({
        title: 'Daily Bible Devotion',
        body: `Oras na para sa iyong debosyon: "${randomTitle}". Simulan ang araw kasama ang Panginoon.`,
        url: '/',
        tag: `scheduled-devotion-${manilaTimeStr}`,
      });

      try {
        await webpush.sendNotification(entry.subscription, payload);
        console.log(`[WebPush] Delivered scheduled push to subscriber at ${manilaTimeStr}`);
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Subscription expired or unregistered
          subscriptions.delete(id);
          console.log(`[WebPush] Removed expired subscription ${id}`);
        } else {
          console.error('[WebPush] Scheduled push delivery error:', err);
        }
      }
    }
  }
}, 60000);

// ==========================================
// 4. GEMINI SERVER-SIDE DEVOTION GENERATION
// ==========================================
app.post('/api/devotions/generate', async (req, res) => {
  const { topic, language = 'fil' } = req.body;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Pakilagay ang paksa o sitwasyon para sa debosyon.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please configure it in AI Studio Secrets.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are a reverent, biblically faithful Christian devotional writer creating an encouraging, relatable Bible devotion.
Topic or Bible Verse requested: "${topic}"
Language requested: ${language === 'taglish' ? 'Natural Taglish (conversational, heartfelt, Metro Manila casual yet reverent)' : language === 'fil' ? 'Conversational Filipino / Tagalog' : 'English'}

WRITING STYLE & FORMAT RULES:
- Title: Catchy, thought-provoking, and memorable (e.g., "Hindi Ka Nahuhuli, Nagmamadali Ka Lang", "Bakit Ka Nag-aalala Kung Pwede Mong Ipagdasal?")
- Tone: Natural Taglish, conversational and heartfelt, Bible-centered with practical everyday application, no repetitive ideas, ready to copy and post.
- Main Verse: Accurate Scripture text and reference (MBBTAG / ASND / NIV). Never fabricate verses.
- Introduction / Pagninilay: Relatable situation connecting real life to God's Word.
- Key Points: Exactly 3 distinct, practical key points with daily application.
- Practical Takeaway: Clear takeaway answering what this teaches about God, plus a personal reflection question for the reader.
- Summary Sentence / Closing Statement: Short, powerful, and memorable.

Return a STRICT JSON object with this exact structure (no markdown, no extra commentary):
{
  "title": "Catchy thought-provoking title",
  "subtitle": "Short explanatory subtitle",
  "introduction": "Engaging relatable opening connecting real life to the message (2-3 paragraphs)",
  "mainVerse": {
    "reference": "Accurate Book Chapter:Verse",
    "translation": "MBBTAG or NIV or ASND",
    "text": "Exact or faithful Scripture text"
  },
  "biblicalStory": "Narrative explanation of the biblical account, distinguishing biblical facts from modern application",
  "shortExplanation": "Spiritual meaning connecting the story to the verse and practical everyday life",
  "keyPoints": [
    {
      "heading": "Memorable Heading 1",
      "explanation": "Clear explanation",
      "practicalConnection": "Everyday Christian application"
    },
    {
      "heading": "Memorable Heading 2",
      "explanation": "Clear explanation",
      "practicalConnection": "Everyday Christian application"
    },
    {
      "heading": "Memorable Heading 3",
      "explanation": "Clear explanation",
      "practicalConnection": "Everyday Christian application"
    }
  ],
  "practicalTakeaway": {
    "aboutGod": "What this teaches about God",
    "whatToChange": "What to change or practice",
    "howToApplyToday": "How to apply this today",
    "summarySentence": "One memorable takeaway sentence"
  },
  "supportingVerses": [
    {
      "reference": "Supporting Verse 1 (e.g. Galacia 6:9)",
      "translation": "MBBTAG",
      "text": "Scripture text",
      "connection": "Brief explanation of how it connects"
    },
    {
      "reference": "Supporting Verse 2 (e.g. Mga Awit 27:14)",
      "translation": "MBBTAG",
      "text": "Scripture text",
      "connection": "Brief explanation of how it connects"
    }
  ],
  "reflectionQuestions": [
    "Personal reflection question 1",
    "Personal reflection question 2"
  ],
  "closingPrayer": "Sincere, heartfelt closing prayer aligned with the lesson",
  "shareableSummary": "Short 2-3 sentence summary suitable for social media / group chats with highlighted verse reference and takeaway"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text?.trim() || '';
    const parsedData = JSON.parse(responseText);

    const fullDevotion = {
      id: `ai-${Date.now()}`,
      category: 'Spiritual Growth',
      coverImage: '/src/assets/images/devotion_open_bible_1793082853866.jpg',
      readTimeMinutes: 4,
      publishedDate: new Date().toISOString().split('T')[0],
      isAiGenerated: true,
      content: {
        [language]: parsedData,
      },
    };

    res.json(fullDevotion);
  } catch (err: unknown) {
    console.error('Gemini devotion generation error:', err);
    res.status(500).json({
      error: 'Hindi matagumpay na nakabuo ng debosyon sa ngayon. Pakisubukang muli.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// ==========================================
// 5. VITE DEV SERVER / STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode.');
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Server] Serving production build from dist/.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Daily Bible Devotion] App running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
