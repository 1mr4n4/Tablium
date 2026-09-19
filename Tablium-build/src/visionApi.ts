import { ClassSession, VisionSettings } from './types';
import { newId } from './utils';

const EXTRACTION_PROMPT = `You are given an image of a university/school weekly timetable (it may be in French, Arabic, or English, e.g. a Moroccan university schedule with "Cours", "TD", "TP", teacher names, room numbers and group codes like "S1"/"S2").

Extract every class session you can see and return ONLY a raw JSON array (no markdown fences, no prose) where each item has exactly this shape:

{
  "day": "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi" | "Dimanche",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "subject": string,
  "type": "Cours" | "TD" | "TP" | "Examen" | "Autre",
  "professor": string | null,
  "room": string | null,
  "group": string | null
}

If a single slot lists two groups (e.g. "TD Marketing S1" and "TD Marketing S2" stacked in the same cell), output them as two separate objects with different "group" values. If a field is not visible, use null. Return nothing but the JSON array.`;

function extractJSONArray(text: string): any[] {
  const cleaned = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('VISION_INVALID_RESPONSE');
  return JSON.parse(cleaned.slice(start, end + 1));
}

function toSessions(raw: any[]): ClassSession[] {
  return raw
    .filter((r) => r && r.day && r.startTime && r.endTime && r.subject)
    .map(
      (r): ClassSession => ({
        id: newId(),
        day: r.day,
        startTime: r.startTime,
        endTime: r.endTime,
        subject: r.subject,
        type: ['Cours', 'TD', 'TP', 'Examen', 'Autre'].includes(r.type) ? r.type : 'Autre',
        professor: r.professor ?? undefined,
        room: r.room ?? undefined,
        group: r.group ?? undefined,
        tasks: [],
        status: 'scheduled',
      })
    );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callOpenAI(apiKey: string, base64: string, mimeType: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          ],
        },
      ],
    }),
  });
    if (!res.ok) throw new Error(`VISION_PROVIDER_ERROR:OpenAI:${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callAnthropic(apiKey: string, base64: string, mimeType: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
            { type: 'text', text: EXTRACTION_PROMPT },
          ],
        },
      ],
    }),
  });
    if (!res.ok) throw new Error(`VISION_PROVIDER_ERROR:Claude:${res.status}`);
  const data = await res.json();
  return (data.content ?? []).map((b: any) => b.text ?? '').join('\n');
}

async function callGemini(apiKey: string, base64: string, mimeType: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: EXTRACTION_PROMPT }, { inline_data: { mime_type: mimeType, data: base64 } }],
          },
        ],
      }),
    }
  );
    if (!res.ok) throw new Error(`VISION_PROVIDER_ERROR:Gemini:${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('\n') ?? '';
}

export async function parseTimetableImage(file: File, settings: VisionSettings): Promise<ClassSession[]> {
  if (!settings.apiKey) {
     throw new Error('VISION_API_KEY_REQUIRED');
  }
  const base64 = await fileToBase64(file);
  const mimeType = file.type || 'image/png';

  let text: string;
  switch (settings.provider) {
    case 'openai':
      text = await callOpenAI(settings.apiKey, base64, mimeType);
      break;
    case 'anthropic':
      text = await callAnthropic(settings.apiKey, base64, mimeType);
      break;
    case 'gemini':
      text = await callGemini(settings.apiKey, base64, mimeType);
      break;
  }

  const raw = extractJSONArray(text);
  return toSessions(raw);
}
