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
    name: "add-expense",
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

mcp.addTool({
    name: "retrieve-expense",
    description: "Retrieve all the expenses from database either by date range or by category or by both category and date ",
    parameters: z.object({
        category: z.string().optional(),
        date: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    }),
    execute: async (args) => {
        try {

            const query: Record<string, any> = {}

            if (args.startDate || args.startDate) {
                query.date = {}
                if (args.startDate) query.date.$gte = args.startDate
                if (args.endDate) query.date.$lte = args.endDate
            }
            else if (args.date) {
                query.date = { $regex: args.date, $options: "i" }
            }

            if (args.category) query.category = { $regex: args.category, $options: "i" }

            const expenses = await Expense.find(query).lean()

            if (expenses.length === 0) {
                return {
                    content: [
                        { type: "text", text: "No matching expense found." }
                    ]
                }
            }

            return {
                content: [
                    { type: "text", text: JSON.stringify(expenses) }
                ]
            }
        } catch (error) {
            console.error('Error retrieving expenses:', error)
            return {
                content: [
                    { type: "text", text: `Error retrieving expenses: ${error instanceof Error ? error.message : 'Unknown error'}` }
                ]
            }
        }
    }
})

mcp.addTool({
    name: "remove-expense",
    description: "Remove an expense from the database. At least one of category, date, or description must be provided. Partial, case-insensitive matches work for category and description.",
    parameters: z.object({
        category: z.string().optional(),
        date: z.string().optional(),
        description: z.string().optional()
    }),
    execute: async (args) => {
        try {
            const query: Record<string, unknown> = {}

            if (args.date) query.date = args.date
            if (args.category) query.category = { $regex: args.category, $options: "i" }
            if (args.description) query.description = { $regex: args.description, $options: "i" }

            const deleted = await Expense.findOneAndDelete(query)

            if (!deleted) {
                return {
                    content: [
                        { type: "text", text: "No matching expense found to delete." }
                    ]
                }
            }

            return {
                content: [
                    { type: "text", text: `Deleted expense: ${deleted.expense} on ${deleted.date} for "${deleted.category}" ("${deleted.description || "N/A"}")` }
                ]
            }
        } catch (error) {
            console.error("Error deleting an expense", error)
            return {
                content: [
                    { type: "text", text: `Error deleting an expense: ${error instanceof Error ? error.message : "Unknown error"}` }
                ]
            }
        }
    }
})

mcp.start({
    transportType: "httpStream",
    httpStream: {
        port: 3001
    }
})