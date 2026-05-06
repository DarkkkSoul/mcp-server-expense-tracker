import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config({ path: "/home/kiouni/Desktop/mcp-expense-tracker/.env" })

export const connectToDB = async (): Promise<void> => {
    if (!process.env.DB_URI) {
        throw new Error("DB_URI environment variable is not defined")
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.error("*****DATABASE ALREADY CONNECTED*****")
        return
    }

    try {
        await mongoose.connect(process.env.DB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            retryWrites: true,
            w: 'majority',
        })
        console.error("*****DATABASE CONNECTED*****")
    } catch (error) {
        console.error("ERROR CONNECTING TO DB:", error)
        throw error
    }
}