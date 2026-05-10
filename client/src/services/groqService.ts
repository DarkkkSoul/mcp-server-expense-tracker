import Groq from 'groq-sdk';
import { tools, mcpClient } from "../mcp/client";

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessageToGroq(
  messages: GroqMessage[]
): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      tools: tools.map((tool: any) => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema
        }
      }))
    });

    const message = response.choices[0]?.message;

    if (message.tool_calls) {
      const tool = message.tool_calls[0]
      const toolName = tool.function.name
      const toolArgs = JSON.parse(tool.function.arguments)

      const mcpResult = await mcpClient.callTool({ name: toolName, arguments: toolArgs })

      const secondResponse = await groq.chat.completions.create({
        messages: [
          ...messages,
          {
            role: "tool",
            tool_call_id: tool.id,
            content: JSON.stringify(mcpResult)
          }
        ],
        model: 'llama-3.3-70b-versatile'
      });

      return secondResponse.choices[0]?.message?.content || 'No response received';
    }

    return message.content || 'No response received';
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}