import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true });

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Fetch tools from API
async function getTools() {
  const response = await fetch('http://localhost:3002/api/tools');
  const data = await response.json();
  return data.tools;
}

// Call MCP tool via API
async function callTool(name: string, args: any) {
  const response = await fetch('http://localhost:3002/api/tools/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, arguments: args })
  });
  return await response.json();
}

export async function sendMessageToGroq(
  messages: GroqMessage[]
): Promise<string> {
  try {
    const tools = await getTools();

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

      const mcpResult = await callTool(toolName, toolArgs)

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