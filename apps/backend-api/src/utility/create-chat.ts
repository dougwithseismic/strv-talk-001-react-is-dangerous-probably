import {
    ChatCompletionMessageParam,
    ChatCompletionTool,
    ChatCompletionMessage,
} from 'openai/resources/index.mjs'
import openAi from './llm/open-ai'

interface ChatOptions {
    tools?: ChatCompletionTool[]

    availableFunctions?: Record<string, (...args: any[]) => any>
    temperature?: number
    maxTokens?: number
    responseFormat?: 'text' | 'json_object'
    model?:
        | (string & {})
        | 'gpt-4-1106-preview'
        | 'gpt-4-vision-preview'
        | 'gpt-4'
        | 'gpt-4-0314'
        | 'gpt-4-0613'
        | 'gpt-4-32k'
        | 'gpt-4-32k-0314'
        | 'gpt-4-32k-0613'
        | 'gpt-3.5-turbo'
        | 'gpt-3.5-turbo-16k'
        | 'gpt-3.5-turbo-0301'
        | 'gpt-3.5-turbo-0613'
        | 'gpt-3.5-turbo-1106'
        | 'gpt-3.5-turbo-16k-0613'
}

type ChatResponse = ChatCompletionMessage

const DEFAULT_CHAT_OPTIONS: ChatOptions = {
    temperature: 0.4,
    maxTokens: 1280,
    model: 'gpt-3.5-turbo-16k',
    responseFormat: 'text',
}

interface ChatParams {
    messages?: ChatCompletionMessageParam[]
    options?: ChatOptions
}
/**
 * Represents a chat session with OpenAI.
 */
class Chat {
    /**
     * The array of chat messages.
     */
    public messages: ChatCompletionMessageParam[]

    /**
     * The options for the chat session.
     */
    public options: ChatOptions

    /**
     * Creates a new instance of the Chat class.
     * @param messages The initial chat messages.
     * @param options The options for the chat session.
     */
    constructor({ messages, options }: ChatParams) {
        this.messages = messages || []
        this.options = { ...DEFAULT_CHAT_OPTIONS, ...options }
    }

    async continue(): Promise<ChatResponse> {
        return await this.performChatCompletion()
    }
    /**
     * Sends a message to the chat session and returns the response.
     * @param message The message to send.
     * @returns A promise that resolves to the chat response.
     */
    async sendMessage(message: string): Promise<ChatResponse> {
        this.messages.push({ role: 'user', content: message })
        return await this.performChatCompletion()
    }

    /**
     * Performs the chat completion and returns the response.
     * @returns A promise that resolves to the chat response.
     */
    private async performChatCompletion(): Promise<ChatResponse> {
        try {
            const createOptions = {
                model: this.options.model || '',
                response_format: { type: this.options.responseFormat },
                temperature: this.options.temperature,
                max_tokens: this.options.maxTokens,
                messages: this.messages || [],
            }

            let response = await openAi.chat.completions.create({
                ...createOptions,
                tool_choice: this.options.tools ? 'required' : undefined,
                tools: this.options.tools ?? undefined,
            })

            let responseMessage = response.choices[0].message
            this.messages.push(responseMessage)

            // Handle tool calls
            const toolCalls = responseMessage.tool_calls
            if (toolCalls) {
                for (const toolCall of toolCalls) {
                    const functionName = toolCall.function.name
                    const functionArgs = JSON.parse(toolCall.function.arguments)
                    try {
                        const functionResponse = await this.options.availableFunctions?.[
                            functionName
                        ](functionArgs)
                        this.messages.push({
                            tool_call_id: toolCall.id,
                            role: 'tool',
                            // @ts-expect-error
                            name: functionName,
                            content: JSON.stringify(functionResponse),
                        })
                    } catch (error) {
                        console.error('Error calling function:')
                        this.messages.push({
                            tool_call_id: toolCall.id,
                            role: 'tool',
                            // @ts-expect-error
                            name: functionName,
                            content: JSON.stringify(error),
                        })
                    }
                }

                // Get a new response from the model, including the function response
            }

            // const finalResponse = await this.performChatCompletion()

            // this.messages.push(finalResponse)

            return responseMessage
        } catch (error) {
            console.error(error)
            throw new Error('Something went wrong with the chat.')
        }
    }
}

export { Chat, ChatOptions, ChatResponse }
