import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Test database connection on startup
export const connectDatabase = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test query
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database query test passed')
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Graceful shutdown
export const disconnectDatabase = async () => {
  await prisma.$disconnect()
  console.log('✅ Database disconnected')
}

// Handle shutdown
process.on('beforeExit', disconnectDatabase)
process.on('SIGTERM', disconnectDatabase)
process.on('SIGINT', disconnectDatabase)