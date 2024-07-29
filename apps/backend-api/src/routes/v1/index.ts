// routes/index.ts
import express from 'express'

const router = express.Router()

const helloWorldRouter = express.Router()
helloWorldRouter.get('/', (req, res) => {
    res.send('Hello, World!')
})

router.use('/v1', [helloWorldRouter])

export default router
