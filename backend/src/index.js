import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import { connectDB } from "./db/index.js";
import { app } from './app.js';
import { initializeSocket } from './socket.js';
import { startReminderScheduler } from './services/reminder.service.js';

const server = createServer(app);
const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.log(`CampusBazaar Server running on port ${port} 🔥`);
});

initializeSocket(server);

connectDB()
    .then(() => {
        startReminderScheduler();
        console.log('Database and services initialized successfully');
    })
    .catch((err) => {
        console.error('MongoDB initial connection error:', err.message);
    });
