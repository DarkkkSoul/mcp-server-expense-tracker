import mongoose, { Schema } from "mongoose";

interface IExpense {
    expense: number;
    category: string;
    date: string;
    description: string;
}

const expenseSchema = new Schema<IExpense>({
    expense: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
}, { timestamps: true })

export const Expense = mongoose.model<IExpense>("Expense", expenseSchema)