import cors from 'cors'
import express from 'express'
import { corsOptions } from './config/cors.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import apiRouter from './routes/index.js'

const app = express()

app.use(cors(corsOptions))
app.use(express.json({ limit: '1mb' }))
app.use((_req, res, next) => {
  res.setHeader('X-Data-Storage', 'in-memory-development')
  next()
})
app.use('/api', apiRouter)
app.use(notFound)
app.use(errorHandler)

export default app
