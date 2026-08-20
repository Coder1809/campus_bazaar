import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const corsOptions = {
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Health check routes
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", service: "CampusBazaar API", timestamp: new Date().toISOString() });
});
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Routes import
import userRoutes from "./routes/user.route.js"
import itemRoutes from "./routes/item.route.js"
import requestRoutes from "./routes/request.route.js"
import transactionRoutes from "./routes/transaction.route.js"
import messageRoutes from "./routes/message.route.js"
import notificationRoutes from "./routes/notification.route.js"

// Routes declaration
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/items", itemRoutes)
app.use("/api/v1/requests", requestRoutes)
app.use("/api/v1/transactions", transactionRoutes)
app.use("/api/v1/messages", messageRoutes)
app.use("/api/v1/notifications", notificationRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export { app }
