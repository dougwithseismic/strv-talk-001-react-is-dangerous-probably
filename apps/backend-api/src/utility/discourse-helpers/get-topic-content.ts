import discourse from '../discourse'

export const getTopicContent = async (topicID: number) => {
    const topicResponse = (await discourse.topics.getTopic(topicID)) as any

    const {
        title,
        post_stream: { posts },
    } = topicResponse

    const postsPayload = posts.map((post: any) => {
        return {
            index: post.id,
            user: post.username,
            body: post.cooked,
        }
    })

    console.log('postsPayload.length :>> ', postsPayload.length);

    return {
        title,
        originalPost: postsPayload[0],
        replies: postsPayload.slice(1),
    }
}
