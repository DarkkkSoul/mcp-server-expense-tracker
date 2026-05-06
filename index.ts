import { FastMCP } from "fastmcp";
import z from "zod";
import { connectToDB } from "./db/connect.js";
import { Expense } from "./db/schema.js";

const mcp = new FastMCP({
    name: "expense-tracker",
    version: "1.0.0"
})

await connectToDB()

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
        try {
            const expense = await Expense.create(args)

            return {
                content: [
                    { type: "text", text: `Expense ${args.expense} added successfully with ID: ${expense._id}` }
                ]
            }
        } catch (error) {
            console.error('Error creating expense:', error)
            return {
                content: [
                    { type: "text", text: `Error adding expense: ${error instanceof Error ? error.message : 'Unknown error'}` }
                ]
            }
        }
    }
})

mcp.start({
    transportType: "stdio"
})