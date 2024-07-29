import { Queue, Worker, Job, WorkerOptions, JobsOptions, FlowProducer } from 'bullmq'
import IORedis from 'ioredis'

export const QUEUE_NAMES = {} as const

type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]

export const connectionOpts = new IORedis({
    host: process.env.REDISHOST, // Redis server hostname
    port: parseInt(process.env.REDISPORT!), // Redis server port
    password: process.env.REDISPASSWORD, // Password to authenticate with the server
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: null,
})

export const flow = new FlowProducer({ connection: connectionOpts })

export const createQueue = <T>(name: string) =>
    new Queue<T>(name, {
        connection: connectionOpts,
    })

interface CreateWorkerOptions extends WorkerOptions {
    concurrency: number
}

export const createWorker = <T>(
    name: string,
    callback: (job: Job<T>, token?: string) => Promise<any>,
    options?: Partial<CreateWorkerOptions>
) =>
    new Worker<T>(name, async (a, b) => callback(a, b), {
        connection: connectionOpts,
        concurrency: options?.concurrency ?? 8,
    })

export interface T {
    payload: T
}

type EventListeners<T> = {
    [event: string]: (job: Job<T>, error?: Error) => void
}

interface BullConfig<T> {
    queueName: QueueName
    jobName?: string
    workerFn?: (job: Job<T>, token?: string) => Promise<any>
    listeners?: EventListeners<T>
    options?: Partial<CreateWorkerOptions>
}

const createBull = <T>(config: BullConfig<T>) => {
    const { queueName, jobName, workerFn, listeners, options } = config
    const queue = createQueue<T>(queueName)
    const worker = createWorker<T>(queueName, workerFn!, options)

    if (listeners) {
        Object.entries(listeners).forEach(([event, handler]) => {
            worker.on(event as any, handler as any)
        })
    }

    const addJobToQueue = async (payload: T, opts?: JobsOptions) => {
        await queue.add(jobName ?? queueName, payload, opts)
    }

    return { queue, worker, addJobToQueue }
}

export default createBull
