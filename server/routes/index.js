import { Router } from 'express'
import authRoutes from './authRoutes.js'
import commentRoutes from './commentRoutes.js'
import communityRoutes from './communityRoutes.js'
import healthRoutes from './healthRoutes.js'
import notificationRoutes from './notificationRoutes.js'
import postRoutes from './postRoutes.js'
import searchRoutes from './searchRoutes.js'
import userRoutes from './userRoutes.js'

const apiRouter = Router()

apiRouter.use('/health', healthRoutes)
apiRouter.use('/auth', authRoutes)
apiRouter.use('/users', userRoutes)
apiRouter.use('/communities', communityRoutes)
apiRouter.use('/posts', postRoutes)
apiRouter.use('/comments', commentRoutes)
apiRouter.use('/notifications', notificationRoutes)
apiRouter.use('/search', searchRoutes)

export default apiRouter
