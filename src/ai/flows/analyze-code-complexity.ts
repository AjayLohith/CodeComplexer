
'use server';
/**
 * @fileOverview Analyzes code and estimates its time and space complexity.
 *
 * - analyzeCodeComplexity - A function that handles the code complexity analysis process.
 * - AnalyzeCodeComplexityInput - The input type for the analyzeCodeComplexity function.
 * - AnalyzeCodeComplexityOutput - The return type for the analyzeCodeComplexity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCodeComplexityInputSchema = z.object({
  code: z.string().describe('The code to be analyzed for complexity.'),
  language: z.enum(['python', 'javascript', 'cpp', 'java']).describe('The programming language of the code.'),
});
export type AnalyzeCodeComplexityInput = z.infer<typeof AnalyzeCodeComplexityInputSchema>;

const AnalyzeCodeComplexityOutputSchema = z.object({
  timeComplexity: z.string().describe('The estimated time complexity of the code (e.g., O(n), O(n log n)).'),
  spaceComplexity: z.string().describe('The estimated space complexity of the code (e.g., O(1), O(n)).'),
  explanation: z.string().describe('A brief explanation of how the complexity was derived.'),
});
export type AnalyzeCodeComplexityOutput = z.infer<typeof AnalyzeCodeComplexityOutputSchema>;

export async function analyzeCodeComplexity(input: AnalyzeCodeComplexityInput): Promise<AnalyzeCodeComplexityOutput> {
  return analyzeCodeComplexityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCodeComplexityPrompt',
  input: {schema: AnalyzeCodeComplexityInputSchema},
  output: {schema: AnalyzeCodeComplexityOutputSchema},
  config: { temperature: 0.2 },
  prompt: `You are an expert software engineer specializing in algorithm analysis. You must be highly precise and consistent in your analysis.

  Analyze the provided code and determine its time and space complexity.
  Provide the complexity in Big O notation.
  Ensure your analysis, especially for space complexity, is deterministic and does not vary for identical code inputs.
  Also, provide a brief explanation for your analysis.

  Language: {{{language}}}
  Code:
  \`\`\`{{language}}
  {{{code}}}
  \`\`\`
  `,
});

const analyzeCodeComplexityFlow = ai.defineFlow(
  {
    name: 'analyzeCodeComplexityFlow',
    inputSchema: AnalyzeCodeComplexityInputSchema,
    outputSchema: AnalyzeCodeComplexityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
