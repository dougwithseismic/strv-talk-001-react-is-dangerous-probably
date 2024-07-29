import { DiscourseSDK } from '@repo/discourse-sdk'

const DEFAULT_USERNAME = 'daddyBiscuit'

const discourse = new DiscourseSDK(
    process.env.DISCOURSE_URL!,
    process.env.DISCOURSE_API_KEY!,
    DEFAULT_USERNAME
)

export default discourse
