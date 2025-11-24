import moduleAlias from "module-alias"
import path from "path"

// Register module aliases
moduleAlias.addAliases({
  "@": path.join(__dirname),
  "@/controllers": path.join(__dirname, "controllers"),
  "@/middleware": path.join(__dirname, "middleware"),
  "@/routes": path.join(__dirname, "routes"),
  "@/utils": path.join(__dirname, "utils"),
  "@/types": path.join(__dirname, "types"),
})

import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import { errorHandler } from "./middleware/error-handler"
import { requestLogger } from "./middleware/request-logger"
import { connectDatabase } from "./utils/database"

import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import blogRoutes from "./routes/blog.routes"
import eventRoutes from "./routes/event.routes"
import galleryRoutes from "./routes/gallery.routes"
import adminRoutes from "./routes/admin.routes"
import contactRoutes from "./routes/contact.routes"
import statsRoutes from "./routes/stats.routes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(requestLogger)

// Health check endpoints
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/gallery", galleryRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/stats", statsRoutes)

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not Found", message: "The requested resource does not exist" })
})

// Start server with database connection
const startServer = async () => {
  try {
    // Test database connection first
    const dbConnected = await connectDatabase()
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...')
      process.exit(1)
    }
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`)
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`)
      console.log(`✓ Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
