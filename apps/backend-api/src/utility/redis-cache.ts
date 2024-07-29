import IORedis from 'ioredis'

type Key =
    | 'product'
    | 'user'
    | 'order'
    | 'category'
    | 'article'
    | 'prompt'
    | 'url'
    | 'summary'
    | 'section'

interface ItemData {
    key: Key
    id: string | number
    value: any
    expireSeconds?: number
}

export class RedisClient {
    private static instance: RedisClient
    public client: IORedis

    private constructor() {
        this.client = new IORedis({
            host: process.env.REDISHOST_CACHE,
            port: parseInt(process.env.REDISPORT_CACHE!),
            password: process.env.REDISPASSWORD_CACHE,
            tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
            maxRetriesPerRequest: null,
        })
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient()
        }
        return RedisClient.instance
    }

    async set(key: Key, id: string, value: any, expireSeconds?: number): Promise<void> {
        const jsonValue = JSON.stringify(value)
        const compositeKey = `item::${String(key)}-${id}`
        if (expireSeconds !== undefined) {
            await this.client.set(compositeKey, jsonValue, 'EX', expireSeconds)
        } else {
            await this.client.set(compositeKey, jsonValue)
        }
    }

    async setMultiple(items: ItemData[]): Promise<void> {
        const pipeline = this.client.pipeline()
        items.forEach(({ key, id, value, expireSeconds }) => {
            const compositeKey = `item::${key}-${id}`
            const jsonValue = JSON.stringify(value)
            pipeline.set(compositeKey, jsonValue)
            if (expireSeconds !== undefined) {
                pipeline.expire(compositeKey, expireSeconds)
            }
        })
        await pipeline.exec()
    }

    async getAll<T>(key: Key): Promise<(T | null)[]> {
        const pattern = `item::${key}-*`
        const keys = await this.scanKeys(pattern)
        if (keys.length === 0) {
            return []
        }
        const values = await this.client.mget(...keys)
        return values.map((value) => (value ? (JSON.parse(value) as T) : null))
    }

    private async scanKeys(pattern: string): Promise<string[]> {
        let cursor = '0'
        const keys: string[] = []
        do {
            const reply = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
            cursor = reply[0]
            keys.push(...reply[1])
        } while (cursor !== '0')
        return keys
    }

    async get<T>(key: Key, id: string | number): Promise<T | null> {
        const compositeKey = `item::${key}-${id}`
        const value = await this.client.get(compositeKey)
        return value ? (JSON.parse(value) as T) : null
    }

    async delete(key: Key, id: string | number): Promise<boolean> {
        const compositeKey = `item::${key}-${id}`
        const result = await this.client.del(compositeKey)
        return result === 1
    }

    async exists(key: Key, id: string | number): Promise<boolean> {
        const compositeKey = `item::${key}-${id}`
        const result = await this.client.exists(compositeKey)
        return result === 1
    }

    async flushAll(): Promise<void> {
        await this.client.flushall()
    }

    async flushType(type: string): Promise<void> {
        const keys = await this.client.keys(`item::${type}-*`)
        await this.client.del(keys)
    }
}

// Usage example
const redisCache = RedisClient.getInstance()

export default redisCache

// Example usage with structured keys
// redisCache.set('products', 1, { name: 'Product A', price: 999 }, 3600);
// redisCache.get<{ name: string; price: number }>('products', 1).then(product => console.log(product));
// redisCache.exists('products', 1).then(exists => console.log('Does product exist?', exists));
// redisCache.delete('products', 1).then(deleted => console.log('Was product deleted?', deleted));
// redisCache.flushAll().then(() => console.log('Cache flushed!'));
