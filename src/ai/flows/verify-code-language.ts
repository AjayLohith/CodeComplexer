
'use server';
/**
 * @fileOverview Verifies if the provided code snippet matches the expected programming language.
 *
 * - verifyCodeLanguage - A function that handles the code language verification process.
 * - VerifyCodeLanguageInput - The input type for the verifyCodeLanguage function.
 * - VerifyCodeLanguageOutput - The return type for the verifyCodeLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyCodeLanguageInputSchema = z.object({
  code: z.string().describe('The code snippet to be verified.'),
  expectedLanguage: z.enum(['python', 'javascript', 'cpp', 'java']).describe('The programming language the code is expected to be in.'),
});
export type VerifyCodeLanguageInput = z.infer<typeof VerifyCodeLanguageInputSchema>;

const VerifyCodeLanguageOutputSchema = z.object({
  isMatch: z.boolean().describe('True if the code language matches the expected language.'),
  actualLanguage: z.string().optional().describe('The detected language of the code if different from expected, or the expected language if it matches.'),
  confidence: z.string().optional().describe('Confidence level (e.g., High, Medium, Low) for the detected language if different. High if it matches.'),
  reasoning: z.string().describe('A brief explanation for the determination, especially if there is a mismatch or uncertainty.'),
});
export type VerifyCodeLanguageOutput = z.infer<typeof VerifyCodeLanguageOutputSchema>;

export async function verifyCodeLanguage(input: VerifyCodeLanguageInput): Promise<VerifyCodeLanguageOutput> {
  return verifyCodeLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyCodeLanguagePrompt',
  input: {schema: VerifyCodeLanguageInputSchema},
  output: {schema: VerifyCodeLanguageOutputSchema},
  prompt: `You are an expert programming language identifier.
  You will be given a code snippet and an expected programming language.
  Your task is to determine if the provided code snippet is written in the '{{expectedLanguage}}' language.

  Code Snippet:
  \`\`\`
  {{{code}}}
  \`\`\`

  Expected Language: {{expectedLanguage}}

  Analyze the code snippet and respond with the following JSON structure:
  - "isMatch": A boolean indicating if the code matches the '{{expectedLanguage}}'.
  - "actualLanguage": If "isMatch" is false, provide the language you believe the code is written in (e.g., "python", "javascript", "java", "cpp"). If "isMatch" is true, this should be '{{expectedLanguage}}'.
  - "confidence": Your confidence in the "actualLanguage" suggestion (e.g., "High", "Medium", "Low"). If "isMatch" is true, this should be "High".
  - "reasoning": A brief explanation for your determination. If it's not a match, explain why and what features suggest the "actualLanguage". If it is a match, briefly state why.
  
  Example for a mismatch if expectedLanguage is 'python' but code is JavaScript:
  {
    "isMatch": false,
    "actualLanguage": "javascript",
    "confidence": "High",
    "reasoning": "The code uses 'let' keyword and 'console.log()', which are common in JavaScript, not Python."
  }

  Example for a match if expectedLanguage is 'python' and code is Python:
  {
    "isMatch": true,
    "actualLanguage": "python",
    "confidence": "High",
    "reasoning": "The code uses Python syntax such as 'def' for function definition and indentation for blocks."
  }
  
  Provide your response in the specified JSON format.
  `,
});

const verifyCodeLanguageFlow = ai.defineFlow(
  {
    name: 'verifyCodeLanguageFlow',
    inputSchema: VerifyCodeLanguageInputSchema,
    outputSchema: VerifyCodeLanguageOutputSchema,
  },
  async (input: VerifyCodeLanguageInput) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback or error handling if prompt returns no output
      return {
        isMatch: false,
        reasoning: 'Could not determine the language.',
        confidence: 'Low',
        actualLanguage: 'unknown'
      };
    }
    return output;
  }
);
