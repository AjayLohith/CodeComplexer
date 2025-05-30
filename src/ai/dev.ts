
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-best-practices.ts';
import '@/ai/flows/suggest-code-fixes.ts';
import '@/ai/flows/analyze-code-complexity.ts';
import '@/ai/flows/verify-code-language.ts';
