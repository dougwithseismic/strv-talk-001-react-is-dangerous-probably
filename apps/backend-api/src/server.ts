// server.ts
import middleware from '@/modules/middleware'
import logger from '@/modules/middleware/logger'
import routes from '@/routes'
import swaggerDocs from '@/swagger'
import { createBullBoard } from '@bull-board/api'
import { ExpressAdapter } from '@bull-board/express'
import dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'

dotenv.config()

const app = express()
const port = process.env.PORT || 666

app.use(middleware)
app.use(routes)

const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/dashboard/queues')

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [],
    serverAdapter: serverAdapter,
})

app.use('/dashboard/queues', serverAdapter.getRouter()) // http://localhost:666/dashboard/queues
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)) // http://localhost:666/api-docs

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack)
    res.status(500).send({ error: 'Something went wrong.' })
})

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from Express with Winston logging and Swagger documentation!')
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send('Internal Server Error')
})

app.listen(port, async () => {
    logger.info(`withSeismic.com ::🤘 :: backend-api :: server up on port ${port}`)
})

// https://sdk.vercel.ai/docs/getting-started/nodejs
