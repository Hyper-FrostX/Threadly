import { Router } from 'express'
import { searchAll } from '../controllers/searchController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

router.get('/', asyncHandler(searchAll))

export default router
