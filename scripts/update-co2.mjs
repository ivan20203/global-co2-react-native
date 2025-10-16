import { writeFile } from 'node:fs/promises';

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable.');
}

const REQUEST_BODY = {
  model: 'gpt-4.1-mini',
  input: [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text:
            'Provide the latest global atmospheric CO₂ concentration in parts per million (ppm). ' +
            'Respond with JSON that includes: "ppm" (number), "timestamp" (ISO 8601 date of the measurement), and "source" (URL to the data source).',
        },
      ],
    },
  ],
  tools: [{ type: 'web_search' }],
  text: {
    format: {
      type: 'json_schema',
      json_schema: {
        name: 'co2_reading',
        schema: {
          type: 'object',
          properties: {
            ppm: { type: 'number' },
            source: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
          required: ['ppm', 'source', 'timestamp'],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  },
};

const response = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
  body: JSON.stringify(REQUEST_BODY),
});

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`OpenAI request failed: ${response.status} ${response.statusText} - ${errorText}`);
}

const json = await response.json();

const outputItems = Array.isArray(json.output) ? json.output : [];
const contentItems = outputItems.flatMap((item) => (Array.isArray(item?.content) ? item.content : []));

const structuredItem = contentItems.find(
  (item) => item && typeof item === 'object' && (item.type === 'json' || item.type === 'json_schema')
);

let reading = structuredItem?.json;

if (!reading) {
  const textItem = contentItems.find((item) => item && typeof item === 'object' && typeof item.text === 'string');
  const fallbackText =
    textItem?.text ??
    (Array.isArray(json.output_text) ? json.output_text.find((entry) => typeof entry === 'string') : json.output_text);

  if (!fallbackText || typeof fallbackText !== 'string') {
    throw new Error('OpenAI response did not include usable content.');
  }

  try {
    reading = JSON.parse(fallbackText);
  } catch (error) {
    throw new Error('Failed to parse OpenAI response JSON.');
  }
}

const ppm = Number(reading?.ppm);
const source = typeof reading?.source === 'string' ? reading.source : undefined;
const timestamp = typeof reading?.timestamp === 'string' ? reading.timestamp : undefined;

if (!Number.isFinite(ppm) || !source || !timestamp) {
  throw new Error('OpenAI response JSON is missing required fields.');
}

const payload = {
  ppm,
  timestamp,
  source,
  updated_at: new Date().toISOString(),
};

const fileUrl = new URL('../data/latest_co2.json', import.meta.url);
await writeFile(fileUrl, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(`Updated CO₂ data: ${ppm} ppm at ${timestamp}`);
