import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

export const mcpClient = new Client(
    { name: "expense-client", version: "1.0.0" },
    { capabilities: {} }
)

const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3001/mcp")  // /mcp is the default endpoint
)

await mcpClient.connect(transport)

export const { tools } = await mcpClient.listTools()