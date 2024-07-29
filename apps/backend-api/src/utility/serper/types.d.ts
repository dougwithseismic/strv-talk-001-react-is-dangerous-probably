// SearchParams is common across all endpoints
export type SearchParams = {
    q: string
    gl?: string
    hl?: string
    num?: number
    autocorrect?: boolean
    page?: number
    type?: string
    engine?: string
}

export type NewsArticle = {
    title: string
    link: string
    snippet: string
    date: string
    source: string
    imageUrl: string
    position: number
}

export type KnowledgeGraph = {
    title: string
    type: string
}

export type OrganicResult = {
    title: string
    link: string
    snippet: string
    date?: string
    sitelinks?: Array<{ title: string; link: string }>
    position: number
    imageUrl?: string
    attributes?: Record<string, string>
}

export type PeopleAlsoAsk = {
    question: string
    snippet: string
    title: string
    link: string
}

export type ImageResult = {
    title: string
    imageUrl: string
    imageWidth: number
    imageHeight: number
    thumbnailUrl: string
    thumbnailWidth: number
    thumbnailHeight: number
    source: string
    domain: string
    link: string
    googleUrl: string
    position: number
}

export type VideoResult = {
    title: string
    link: string
    snippet: string
    date: string
    imageUrl: string
    position: number
}

export type PlaceResult = {
    position: number
    title: string
    address: string
    latitude: number
    longitude: number
    thumbnailUrl: string
    rating: number
    ratingCount: number
    category: string
    phoneNumber: string
    cid: string
}

export type ShoppingProduct = {
    title: string
    source: string
    link: string
    price: string
    delivery: string
    imageUrl: string
    offers: string
    productId: string
    position: number
}

// Response types
export type NewsResponse = {
    searchParameters: SearchParams
    news: NewsArticle[]
    [key: string]: any
}

export type SearchResponse = {
    searchParameters: SearchParams
    knowledgeGraph?: KnowledgeGraph
    organic: OrganicResult[]
    peopleAlsoAsk?: PeopleAlsoAsk[]
    [key: string]: any
}

export type ImagesResponse = {
    searchParameters: SearchParams
    images: ImageResult[]
    [key: string]: any
}

export type VideosResponse = {
    searchParameters: SearchParams
    videos: VideoResult[]
    [key: string]: any
}

export type PlacesResponse = {
    searchParameters: SearchParams
    places: PlaceResult[]
    [key: string]: any
}

export type ShoppingResponse = {
    searchParameters: SearchParams
    shopping: ShoppingProduct[]
    [key: string]: any
}
