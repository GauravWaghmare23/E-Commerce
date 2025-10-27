import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!).then(
            () => console.log('MongoDB connected')
        ).catch(
            err => console.log(err)
        )
    } catch (error) {
        console.error(error)
    }
}