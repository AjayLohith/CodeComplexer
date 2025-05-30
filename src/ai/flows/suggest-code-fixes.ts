
'use server';

/**
 * @fileOverview Implements a Genkit flow that suggests code fixes for errors in the user's code.
 *
 * - suggestCodeFixes - A function that takes code and an error message and returns suggested fixes.
 * - SuggestCodeFixesInput - The input type for the suggestCodeFixes function.
 * - SuggestCodeFixesOutput - The return type for the suggestCodeFixes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCodeFixesInputSchema = z.object({
  code: z.string().describe('The code to be analyzed.'),
  errorMessage: z.string().describe('The error message associated with the code.'),
  language: z.enum(['Python', 'JavaScript', 'C++', 'Java']).describe('The programming language of the code.'),
});
export type SuggestCodeFixesInput = z.infer<typeof SuggestCodeFixesInputSchema>;

const SuggestCodeFixesOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested code fixes.'),
});
export type SuggestCodeFixesOutput = z.infer<typeof SuggestCodeFixesOutputSchema>;

export async function suggestCodeFixes(input: SuggestCodeFixesInput): Promise<SuggestCodeFixesOutput> {
  return suggestCodeFixesFlow(input);
}

// Schema for the prompt's template context
const PromptTemplateInputSchema = SuggestCodeFixesInputSchema.extend({
  languageId: z.string().describe('The programming language identifier, in lowercase.'),
});
// This type is not exported as it's internal to the flow
// type PromptTemplateInput = z.infer<typeof PromptTemplateInputSchema>;


const prompt = ai.definePrompt({
  name: 'suggestCodeFixesPrompt',
  input: {schema: PromptTemplateInputSchema}, // Use the extended schema
  output: {schema: SuggestCodeFixesOutputSchema},
  prompt: `You are an AI code assistant that suggests code fixes based on error messages.

  Given the following code and error message, provide an array of suggestions to fix the code.
  The suggestions should be specific and actionable.
  Consider common errors for the given language.

  Language: {{{language}}}
  Code:
  \`\`\`{{{languageId}}}
  {{{code}}}
  \`\`\`
  Error Message: {{{errorMessage}}}
  `,
});

const suggestCodeFixesFlow = ai.defineFlow(
  {
    name: 'suggestCodeFixesFlow',
    inputSchema: SuggestCodeFixesInputSchema, // Flow's external input schema
    outputSchema: SuggestCodeFixesOutputSchema,
  },
  async (flowInput: SuggestCodeFixesInput) => {
    const promptInput = {
      ...flowInput,
      languageId: flowInput.language.toLowerCase(), // Prepare languageId for the template
    };
    const {output} = await prompt(promptInput); // Pass the transformed input
    return output!;
  }
);
