import { GoogleGenAI } from 'https://esm.sh/@google/genai';

const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY)
  ? process.env.API_KEY
  : (typeof window !== 'undefined' ? window.API_KEY || '' : '');

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, retries = 3, backoffMs = 800) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await delay(backoffMs * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
}

function fallbackJson(stage) {
  if (stage === 1) {
    return {
      entities: [{ id: 'e1', name: 'User', description: 'Primary actor', attributes: ['role', 'goals'] }],
      relationships: [{ source: 'User', target: 'Project', type: 'creates' }],
      coreFlows: [{ id: 'f1', name: 'Project Blueprinting', steps: ['Intake', 'Architecture', 'Synthesis'] }]
    };
  }
  if (stage === 2) {
    return {
      frontend: ['React 19', 'TailwindCSS'],
      backend: ['Node.js API', 'Serverless Functions'],
      infrastructure: ['Cloud Run', 'Managed Postgres', 'Object Storage'],
      apiSchemas: [{ endpoint: '/api/projects', method: 'POST', purpose: 'Store blueprint' }],
      securityRequirements: ['JWT auth', 'PII encryption at rest', 'rate limits'],
      folderStructure: { src: ['components', 'services', 'state', 'utils'] }
    };
  }
  return {
    masterPrompt: 'Create a production-grade AI-native SaaS based on provided architecture and flows.',
    workspaceFiles: {
      cursorRules: '# .cursorrules\n- Follow clean architecture\n- Ship testable modules',
      readme: '# AI Conception Studio Pro\n\nGenerated implementation workspace.',
      boilerplate: { 'src/main.tsx': 'import App from "./App";' }
    }
  };
}

async function generateJSON({ model, prompt, config = {}, stage }) {
  if (!ai) return fallbackJson(stage);

  const result = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        ...config
      }
    });

    const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(text);
  });

  return result;
}

export async function runPipeline(userInput) {
  const stage1 = await generateJSON({
    model: 'gemini-3-flash-preview',
    stage: 1,
    prompt: `Extract entities, relationships and core flows from:\n${userInput}`
  });

  const stage2 = await generateJSON({
    model: 'gemini-3-flash-preview',
    stage: 2,
    prompt: `Design architecture from this logic:\n${JSON.stringify(stage1, null, 2)}`
  });

  const stage3 = await generateJSON({
    model: 'gemini-3-pro-preview',
    stage: 3,
    config: { thinkingConfig: { thinkingBudget: 32768 } },
    prompt: `Generate master prompt and workspace files using Stage1 + Stage2:\n${JSON.stringify({ stage1, stage2 }, null, 2)}`
  });

  return { stage1, stage2, stage3 };
}

export async function architectCopilot(prompt, thinking = true) {
  if (!ai) return 'Copilot fallback: add API key to enable deep architectural reasoning.';

  const response = await withRetry(async () => ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: thinking ? { thinkingBudget: 32768 } : undefined
    }
  }));

  return response.text || 'No response';
}

export async function runOnboardingResearch(prompt) {
  if (!ai) {
    return { summary: 'Fallback research: validate market demand with interviews and benchmark existing tools.' };
  }

  const response = await withRetry(async () => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      tools: [{ googleSearch: {} }]
    }
  }));

  return JSON.parse(response.text || '{}');
}

export async function synthesizeImage(prompt, resolution = '1024', aspectRatio = '1:1') {
  if (!ai) return { url: '', message: 'API key missing, returning placeholder image metadata.' };

  const response = await withRetry(async () => ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: `${prompt}\nResolution:${resolution}\nAspect Ratio:${aspectRatio}`
  }));

  return { url: '', raw: response.text || 'Image generated.' };
}

export async function generateMotionVideo(prompt, aspectRatio = '16:9') {
  if (!ai) return { id: 'fallback-video-job', status: 'queued-offline' };

  return withRetry(async () => ai.models.generateContent({
    model: 'veo-3.1-fast-generate-preview',
    contents: `${prompt}\nOutput ratio:${aspectRatio}`
  }));
}

export async function generateTTS(text, voice = 'Zephyr') {
  if (!ai) return { audioBase64: null, mimeType: 'audio/wav' };

  return withRetry(async () => ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: text,
    config: { speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } }
  }));
}
