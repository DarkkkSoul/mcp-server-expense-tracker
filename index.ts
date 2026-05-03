import { FastMCP } from "fastmcp";
import z from "zod";
import { connectToDB } from "./db/connect";
import { Expense } from "./db/schema";

const mcp = new FastMCP({
    name: "expense-tracker",
    version: "1.0.0"
})

connectToDB()

mcp.addTool({
    name: "Add Expense",
    description: "Adding expense to Database",
    parameters: z.object({
        expense: z.number(),
        category: z.string(),
        date: z.string(),
        description: z.string()
    }),
    execute: async (args) => {

        const expense = await Expense.create(args)

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