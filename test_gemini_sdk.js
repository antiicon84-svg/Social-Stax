import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const envPath = path.resolve(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found in project root.');
    process.exit(2);
  }
  const env = fs.readFileSync(envPath, 'utf8').split(/\r?\n/).reduce((acc, line) => {
    const m = line.match(/^\s*([^#=]+)=([\s\S]*)$/);
    if (m) acc[m[1].trim()] = m[2].trim();
    return acc;
  }, {});

  const key = env.VITE_GOOGLE_API_KEY || env.GOOGLE_API_KEY;
  if (!key) {
    console.error('No Google API key found in .env.local (looked for VITE_GOOGLE_API_KEY, GOOGLE_API_KEY).');
    process.exit(2);
  }

  try {
    console.log('Initializing GoogleGenerativeAI with API key...');
    const genAI = new GoogleGenerativeAI(key);

    console.log('Getting generative model (gemini-2.5-pro)...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    console.log('Generating content with prompt: "briefly, what is a large language model?"...');
    const prompt = 'briefly, what is a large language model?';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('\n---SUCCESS---');
    console.log('Response from Gemini Pro:\n');
    console.log(text);
    console.log('\n----------------');
    process.exit(0);

  } catch (error) {
    console.error('\n---ERROR---');
    console.error('An error occurred while using the Google Generative AI SDK:');
    console.error(error);
    console.error('\n----------------');
    process.exit(1);
  }
}

main();
