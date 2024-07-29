/// <reference lib="dom" />
import {
    SearchParams,
    NewsResponse,
    SearchResponse,
    ImagesResponse,
    VideosResponse,
    PlacesResponse,
    ShoppingResponse,
} from './types' // Make sure the path to types.d.ts is correct

type ResponseTypes = {
    search: SearchResponse
    news: NewsResponse
    images: ImagesResponse
    videos: VideosResponse
    places: PlacesResponse
    shopping: ShoppingResponse
}

/**
 * Serper class for making requests to the Serper API.
 */
class Serper {
    private apiKey: string
    private baseUrl: string

    /**
     * Constructs a new instance of the Serper class.
     * @param apiKey The API key for authentication.
     */
    constructor(apiKey: string) {
        this.apiKey = apiKey
        this.baseUrl = 'https://google.serper.dev'
    }

    /**
     * Makes a request to the Serper API.
     * @param endpoint The API endpoint to call.
     * @param params The search parameters.
     * @returns A promise that resolves to the API response.
     * @throws An error if the HTTP response is not successful.
     */
    private async makeRequest<T extends keyof ResponseTypes>(
        endpoint: T,
        params: Partial<SearchParams>
    ): Promise<ResponseTypes[T]> {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'X-API-KEY': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return (await response.json()) as ResponseTypes[T]
        } catch (error: any) {
            // Handle the error here
            console.error('An error occurred:', error)
            throw new Error(error)
        }
    }

    /**
     * Performs a search request.
     * @param params The search parameters.
     * @returns A promise that resolves to the search response.
     */
    public search = (params: SearchParams) => this.makeRequest('search', params)

    /**
     * Performs a news request.
     * @param params The search parameters.
     * @returns A promise that resolves to the news response.
     */
    public news = (params: SearchParams) => this.makeRequest('news', params)

    /**
     * Performs an images request.
     * @param params The search parameters.
     * @returns A promise that resolves to the images response.
     */
    public images = (params: SearchParams) => this.makeRequest('images', params)

    /**
     * Performs a videos request.
     * @param params The search parameters.
     * @returns A promise that resolves to the videos response.
     */
    public videos = (params: SearchParams) => this.makeRequest('videos', params)

    /**
     * Performs a places request.
     * @param params The search parameters.
     * @returns A promise that resolves to the places response.
     */
    public places = (params: SearchParams) => this.makeRequest('places', params)

    /**
     * Performs a shopping request.
     * @param params The search parameters.
     * @returns A promise that resolves to the shopping response.
     */
    public shopping = (params: SearchParams) => this.makeRequest('shopping', params)
}

export default Serper
