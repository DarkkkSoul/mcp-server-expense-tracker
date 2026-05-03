import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

export const connectToDB = async (): Promise<void> => {
    if (!process.env.DB_URI) {
        throw new Error("DB_URI environment variable is not defined")
    }

    try {
        await mongoose.connect(process.env.DB_URI)
        console.log("*****DATABASE CONNECTED*****")
    } catch (error) {
        console.log("ERROR CONNECTING TO DB:", error)
    }
}