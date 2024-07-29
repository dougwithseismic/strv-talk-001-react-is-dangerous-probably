// import { ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources'
import { ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { Chat } from './create-chat'

type Instruction = string
interface InstructionOptions {
    temperature?: number
    maxTokens?: number
    model?: string
    responseFormat?: 'json_object' | 'text' | undefined
    messages?: ChatCompletionMessageParam[]
}
export const doInstructions = async (instructions: Instruction[], options?: InstructionOptions) => {
    const DEFAULT_OPTIONS = {
        temperature: 0.7,
        maxTokens: 4096,
        model: 'gpt-4-turbo-preview',
        messages: [],
    }

    options = { ...DEFAULT_OPTIONS, ...options }

    const chat = new Chat({
        messages: options.messages || [],
        options: {
            temperature: options.temperature ?? 0.7,
            maxTokens: options.maxTokens ?? 4096,
            model: options.model ?? 'gpt-4-turbo-preview',
            responseFormat: options.responseFormat ?? 'text',
            tools: [
                // {
                //     type: 'function',
                //     function: {
                //         name: 'scrape_page',
                //         description: 'Reads URLs and returns them as an array of markdown',
                //         parameters: {
                //             type: 'object',
                //             properties: {
                //                 url: {
                //                     type: 'array',
                //                     description:
                //                         'An array of strings that represent URLs to scrape',
                //                     items: {
                //                         type: 'string',
                //                         description: 'A URL to scrape including https://',
                //                     },
                //                 },
                //             },
                //             required: ['url'],
                //         },
                //     },
                // },
                // {
                //     type: 'function',
                //     function: {
                //         name: 'reddit_query',
                //         description: 'Queries Reddit posts based on a given query and options',
                //         parameters: {
                //             type: 'object',
                //             properties: {
                //                 query: {
                //                     type: 'string',
                //                     description: 'The search query for Reddit posts',
                //                 },
                //                 options: {
                //                     type: 'object',
                //                     properties: {
                //                         subreddit: {
                //                             type: 'string',
                //                             description: 'Specific subreddit to query',
                //                         },
                //                         fetchPostData: {
                //                             type: 'boolean',
                //                             description: 'Flag to fetch additional post data',
                //                         },
                //                     },
                //                     required: ['query'],
                //                 },
                //             },
                //             required: ['query'],
                //         },
                //     },
                // },
                // {
                //     type: 'function',
                //     function: {
                //         name: 'fetch_subreddit',
                //         description:
                //             'Fetches posts from a specific subreddit and returns all informatio needed',
                //         parameters: {
                //             type: 'object',
                //             properties: {
                //                 subredditName: {
                //                     type: 'string',
                //                     description: 'The name of the subreddit',
                //                 },
                //             },
                //             required: ['subredditName'],
                //         },
                //     },
                // },
                {
                    type: 'function',
                    function: {
                        name: 'get_stock_photo',
                        description:
                            'Search for photos on Pexels with a specified query and pagination options',
                        parameters: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: "The search query, e.g., 'bong'",
                                },
                                per_page: {
                                    type: 'integer',
                                    description: 'The number of results per page',
                                },
                            },
                            required: ['query'],
                        },
                    },
                },
                // {
                //     type: 'function',
                //     function: {
                //         name: 'get_stock_video',
                //         description:
                //             'Search for stock videos on Pexels with a specified query and pagination options',
                //         parameters: {
                //             type: 'object',
                //             properties: {
                //                 query: {
                //                     type: 'string',
                //                     description: "The search query, e.g., 'bong'",
                //                 },
                //                 per_page: {
                //                     type: 'integer',
                //                     description: 'The number of results per page - default 1.',
                //                 },
                //             },
                //             required: ['query'],
                //         },
                //     },
                // },
                // {
                //     type: 'function',
                //     function: {
                //         name: 'get_google_search_results',
                //         description:
                //             'Get search results from Google using the Serper.dev API. Returns a list of search results, snippets, knowledge graphs and more',
                //         parameters: {
                //             type: 'object',
                //             properties: {
                //                 q: {
                //                     type: 'string',
                //                     description: "The search query, e.g., 'bong'",
                //                 },
                //             },
                //             required: ['query'],
                //         },
                //     },
                // },
            ],
            availableFunctions: {
                // scrape_page: async (url: string) => await scrapePage(url),
                // get_google_search_results: async (query: string) => {
                //     const serper = new Serper(process.env.SERPER_API_KEY!)
                //     const result = await serper.search({
                //         q: query,
                //     })
                //     return result
                // },
                // reddit_query: Reddit.query,
                // fetch_subreddit: Reddit.fetchSubreddit,
                // get_stock_video: async (query, page) =>
                //     pexels.videos.search({ query, per_page: page }),
            },
        },
    })

    const responses: ChatCompletionMessage[] = []
    for (const instruction of instructions) {
        try {
            let response = await chat.sendMessage(instruction)

            let trimmedContent = response.content?.trim() || ''
            chat.messages.push({ ...response, content: trimmedContent })
            responses.push(response)

            let statusMatch = trimmedContent.match(/STATUS:([A-Z_]+)/)
            let status = statusMatch ? statusMatch[1] : 'UNKNOWN'

            while (status.includes('PROGRESS')) {
                response = await chat.continue()

                trimmedContent = response.content?.trim() || ''
                chat.messages.push({ ...response, content: trimmedContent })
                responses.push({ ...response, content: trimmedContent })

                statusMatch = trimmedContent.match(/STATUS:([A-Z_]+)/)
                status = statusMatch ? statusMatch[1] : 'UNKNOWN'
            }

            console.log(`Instruction Complete: ${instruction}`)
        } catch (error) {
            console.error('Error in processing instruction:', error)
        }
    }

    // console.log('responses :>> ', responses)

    return responses
}
