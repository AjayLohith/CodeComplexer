'use server';

/**
 * @fileOverview Analyzes code and suggests refactoring opportunities to follow coding best practices.
 *
 * - suggestBestPractices - A function that handles the code analysis and best practice suggestion process.
 * - SuggestBestPracticesInput - The input type for the suggestBestPractices function.
 * - SuggestBestPracticesOutput - The return type for the suggestBestPractices function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBestPracticesInputSchema = z.object({
  code: z.string().describe('The code to be analyzed for best practices.'),
  language: z.enum(['python', 'javascript', 'cpp', 'java']).describe('The programming language of the code.'),
});
export type SuggestBestPracticesInput = z.infer<typeof SuggestBestPracticesInputSchema>;

const SuggestBestPracticesOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of refactoring suggestions to improve code quality and adhere to best practices.'),
});
export type SuggestBestPracticesOutput = z.infer<typeof SuggestBestPracticesOutputSchema>;

export async function suggestBestPractices(input: SuggestBestPracticesInput): Promise<SuggestBestPracticesOutput> {
  return suggestBestPracticesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBestPracticesPrompt',
  input: {schema: SuggestBestPracticesInputSchema},
  output: {schema: SuggestBestPracticesOutputSchema},
  prompt: `You are an expert software engineer specializing in code refactoring and best practices.

  You will analyze the provided code and suggest refactoring opportunities to improve its quality, readability, and maintainability.
  The suggestions should be specific and actionable, focusing on aspects such as code structure, naming conventions, error handling, and performance.
  The suggestions should be returned as a JSON array of strings.

  Language: {{{language}}}
  Code:
  {{{
    code
  }}}
  `,
});

const suggestBestPracticesFlow = ai.defineFlow(
  {
    name: 'suggestBestPracticesFlow',
    inputSchema: SuggestBestPracticesInputSchema,
    outputSchema: SuggestBestPracticesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
