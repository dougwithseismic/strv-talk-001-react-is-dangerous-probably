// routes/index.ts
import express from 'express'
import v1Router from './v1';

const router = express.Router()

router.use('/api', [v1Router])

export default router
