import express from 'express';
import cors from 'cors';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Initialize MCP client
const mcpClient = new Client(
    { name: "expense-api-client", version: "1.0.0" },
    { capabilities: {} }
);

const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3001/mcp")
);

await mcpClient.connect(transport);

// Get available tools
app.get('/api/tools', async (req, res) => {
    try {
        const { tools } = await mcpClient.listTools();
        res.json({ tools });
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Call a tool
app.post('/api/tools/call', async (req, res) => {
    try {
        const { name, arguments: args } = req.body;
        const result = await mcpClient.callTool({ name, arguments: args });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
});

app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});
