import { EventEmitter } from 'events'
import { Browser, Page } from 'puppeteer'
import { Browser as CoreBrowser } from 'puppeteer-core'


export type BrowserType = Browser | CoreBrowser

export interface TableData {
    [key: string]: string | undefined
}

export interface MetaTag {
    name: string | null | undefined
    content: string | null | undefined
}

export type ParsedContent = any

export type ScrapeUrlResponse = {
    url: string
    content: ParsedContent
    metaTags: MetaTag[]
} | null

export interface ScrapeOptions {
    sameSubDirOnly?: boolean
    depth?: number
    limit?: number
    sitemapUrl?: string | string[] | null
    concurrency?: number
    crawlLinks?: boolean
    findSiteMap?: boolean
    headless?: boolean
    useragent?: string
    browserWSEndpoint?: string
    args?: string[]
    puppetType: 'puppeteer' | 'puppeteer-core' | 'puppeteer-extra'
    proxy?: {
        url?: string
        username: string
        password: string
    }
}


export interface TaskQueueEmitter extends EventEmitter {
    on(event: 'success', listener: (job: ScrapeUrlResponse) => void): this
    on(event: 'error', listener: (error: unknown) => void): this
    on(event: 'finished', listener: () => void): this
}
export interface ScraperState {
    visited: Set<string>
    links: Set<string>
    jobQueue: string[]
    browser: BrowserType | null
    rootUrl: string
    progress: ProgressState
    runCallback: (browser: BrowserType, page: Page) => any
}

export interface ProgressState {
    completed: number
    inProgress: number
    total: number
}
