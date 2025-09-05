'use server';

/**
 * @fileOverview AI-powered chat assistance for SimuMeet, leveraging OpenRouter API for human-like responses.
 *
 * - aiChatAssistance - A function that processes user queries and returns AI-generated responses.
 * - AIChatAssistanceInput - The input type for the aiChatAssistance function.
 * - AIChatAssistanceOutput - The return type for the aiChatAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatAssistanceInputSchema = z.object({
  query: z.string().describe('The user query to be answered by the AI.'),
});
export type AIChatAssistanceInput = z.infer<typeof AIChatAssistanceInputSchema>;

const AIChatAssistanceOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the user query.'),
});
export type AIChatAssistanceOutput = z.infer<typeof AIChatAssistanceOutputSchema>;

export async function aiChatAssistance(input: AIChatAssistanceInput): Promise<AIChatAssistanceOutput> {
  return aiChatAssistanceFlow(input);
}

const aiChatAssistancePrompt = ai.definePrompt({
  name: 'aiChatAssistancePrompt',
  input: {schema: AIChatAssistanceInputSchema},
  output: {schema: AIChatAssistanceOutputSchema},
  prompt: `You are a helpful assistant in a meeting environment.
  Answer the following question to the best of your ability using your knowledge:
  {{query}}`,
});

const aiChatAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatAssistanceFlow',
    inputSchema: AIChatAssistanceInputSchema,
    outputSchema: AIChatAssistanceOutputSchema,
  },
  async input => {
    const {output} = await aiChatAssistancePrompt(input);
    return output!;
  }
);
