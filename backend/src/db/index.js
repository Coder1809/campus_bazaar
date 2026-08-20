import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    const rawUri = process.env.MONGODB_URI;
    
    if (rawUri) {
        try {
            let uri = rawUri;
            if (!rawUri.includes('mongodb+srv') && !rawUri.includes('?')) {
                const parts = rawUri.replace(/\/$/, '').split('/');
                const lastPart = parts[parts.length - 1];
                if (!lastPart.includes(':') && lastPart !== '') {
                    // DB name already present in URI
                    uri = rawUri;
                } else {
                    uri = `${rawUri.replace(/\/$/, '')}/${DB_NAME}`;
                }
            }
            const connectionInstance = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 5000
            });
            console.log(`\n MongoDB Connected !! ${connectionInstance.connection.host}`);
            return;
        } catch (error) {
            console.log('Primary MongoDB connection failed, attempting local MongoDB fallback...', error.message);
        }
    }

    try {
        const localUri = `mongodb://127.0.0.1:27017/${DB_NAME}`;
        const localInstance = await mongoose.connect(localUri);
        console.log(`\n Local MongoDB Connected !! ${localInstance.connection.host}`);
    } catch (fallbackError) {
        console.log('MONGO DB connection error (both primary and local failed):', fallbackError.message);
        process.exit(1);
    }
};
