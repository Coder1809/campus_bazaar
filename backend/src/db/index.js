import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    const rawUri = process.env.MONGODB_URI;
    
    if (rawUri) {
        try {
            let uri = rawUri.trim();
            // Handle mongodb+srv and standard URIs to ensure DB_NAME is set
            if (!uri.includes(`/${DB_NAME}`) && !uri.includes(`/${DB_NAME}?`)) {
                if (uri.includes('?')) {
                    const [base, query] = uri.split('?');
                    uri = `${base.replace(/\/$/, '')}/${DB_NAME}?${query}`;
                } else {
                    uri = `${uri.replace(/\/$/, '')}/${DB_NAME}`;
                }
            }

            const connectionInstance = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000
            });
            console.log(`\n MongoDB Connected !! ${connectionInstance.connection.host}`);
            return;
        } catch (error) {
            console.error('Primary MongoDB connection failed:', error.message);
        }
    }

    try {
        const localUri = `mongodb://127.0.0.1:27017/${DB_NAME}`;
        const localInstance = await mongoose.connect(localUri);
        console.log(`\n Local MongoDB Connected !! ${localInstance.connection.host}`);
    } catch (fallbackError) {
        console.error('MONGO DB connection error (both primary and local failed):', fallbackError.message);
        if (process.env.NODE_ENV === 'production') {
            console.error('CRITICAL: Check MONGODB_URI and Atlas IP whitelist (0.0.0.0/0) in Render environment variables.');
        }
        process.exit(1);
    }
};
