import { FastMCP } from "fastmcp";
import z from "zod";

const mcp = new FastMCP({
    name: "expense-tracker",
    version: "1.0.0"
})

mcp.addTool({
    name: "Add Expense",
    description: "Adding expense to Database",
    parameters: z.object({
        expense: z.number
    }),
    execute: async (args) => {
        return {
            content: [
                { type: "text", text: `Expense ${args.expense} added` }
            ]
        }
    }
})

mcp.start({
    transportType: "stdio"
})