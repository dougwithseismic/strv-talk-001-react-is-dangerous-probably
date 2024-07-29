import { EventEmitter } from 'events'
import { ScrapeOptions, ScrapeUrlResponse, ProgressState } from './types'
import { Browser as CoreBrowser } from 'puppeteer-core'

import puppeteer, { Browser, Page, PuppeteerNodeLaunchOptions } from 'puppeteer'
import puppeteerExtra from 'puppeteer-extra'

import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import puppeteerCore from 'puppeteer'

type BrowserType = Browser | CoreBrowser

type PuppetType = 'puppeteer' | 'puppeteer-core' | 'puppeteer-extra'

interface DefaultScraperOptions {
    sameSubDirOnly: boolean
    depth: number
    limit: number
    sitemapUrl: string | string[] | null
    concurrency: number
    crawlLinks: boolean
    crawlFilter: (url: string) => boolean
    useragent: string
    browserWSEndpoint: string | undefined
    args: string[]
    puppeteerOptions: DefaultPuppeteerOptions
    puppetType: PuppetType
    proxy?: {
        url: string
        username: string
        password: string
    }
}

interface DefaultPuppeteerOptions extends PuppeteerNodeLaunchOptions {}

const DEFAULT_OPTIONS: DefaultScraperOptions = {
    sameSubDirOnly: false,
    depth: 3,
    limit: 1,
    sitemapUrl: null,
    concurrency: 4,
    crawlLinks: false,
    crawlFilter: (url) => true,
    useragent: '',
    puppeteerOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: {
            width: 1280,
            height: 960,
        },
    },
    browserWSEndpoint: undefined,
    args: [],
    puppetType: 'puppeteer',
}

interface WebsiteCrawlerArgs {
    options?: Partial<DefaultScraperOptions>
}

type CrawlState = {
    visited: Set<string>
    links: Set<string>
    progress: {
        total: number
        inProgress: number
        completed: number
    }
}

type CustomListeners = {
    onTaskComplete?: (result: ScrapeUrlResponse) => void
    onTaskError?: (error: Error) => void
    onFinish?: (results: ScrapeUrlResponse[]) => void
}

type RunCallback = (browser: BrowserType, page: Page) => Promise<any>

type CrawlSiteArgs = {
    url: string | string[]
    run: RunCallback
    listeners?: CustomListeners
    options?: Partial<DefaultScraperOptions>
}

class SiteCrawler {
    private eventEmitter = new EventEmitter()
    private results: ScrapeUrlResponse[] = []
    private activeWorkers = 0

    public concurrency = 4
    public isPaused = false

    public options = DEFAULT_OPTIONS

    private jobQueue: string[] = []
    private puppet: typeof puppeteer | typeof puppeteerExtra | null = null
    private browser: BrowserType | null = null

    // Callbacks and Listeners
    private listeners: CustomListeners = {}
    private runCallback: RunCallback = async () => {}

    private crawlState: CrawlState = {
        visited: new Set<string>(),
        links: new Set<string>(),
        progress: {
            total: 0,
            inProgress: 0,
            completed: 0,
        },
    }

    constructor({ options = DEFAULT_OPTIONS }: WebsiteCrawlerArgs = {}) {
        Object.assign(this.options, options)
        this.puppet = this.initPuppet(options.puppetType ?? DEFAULT_OPTIONS.puppetType)
    }

    private initPuppet = (browserType: PuppetType) => {
        switch (browserType) {
            // Allows for extension of browser types
            case 'puppeteer-extra':
                puppeteerExtra.use(StealthPlugin())
                return puppeteerExtra

            case 'puppeteer-core':
                return puppeteerCore
            default:
                return puppeteer
        }
    }

    private setupListeners(): void {
        this.eventEmitter.on('taskCompleted', (result: ScrapeUrlResponse) => {
            this.listeners.onTaskComplete?.(result)
            this.activeWorkers--

            this.checkQueue()
        })

        this.eventEmitter.on('taskError', (error: Error) => {
            this.listeners.onTaskError?.(error)
            this.activeWorkers--

            this.checkQueue()
        })
    }

    private initBrowser = async (): Promise<BrowserType> => {
        if (this.options.browserWSEndpoint) {
            return await this.puppet!.connect({
                browserWSEndpoint: this.options.browserWSEndpoint,
            })
        } else {
            return await this.puppet!.launch(this.options.puppeteerOptions)
        }
    }

    async crawlSite({ url, listeners, run, options }: CrawlSiteArgs): Promise<ScrapeUrlResponse[]> {
        this.results = [] // Reset results for a new crawl.
        Object.assign(this.options, options) // Bring in any new options.
        this.browser = await this.initBrowser() // Initialize the browser.
        this.runCallback = run // Set the run callback.

        this.listeners = listeners ?? {}
        this.setupListeners()
        this.populateJobQueue(url)
        this.spawnWorkers()

        return new Promise<ScrapeUrlResponse[]>((resolve) => {
            this.eventEmitter.on('allTasksCompleted', () => {
                this.listeners.onFinish?.(this.results)
                resolve(this.results)

                try {
                    this.browser?.close()
                    this.browser = null
                } catch (error) {
                    console.log('error :>> ', error)
                }
            })
        })
    }

    private async spawnWorkers(): Promise<void> {
        while (this.jobQueue.length > 0 && this.activeWorkers <= this.options.concurrency) {
            this.activeWorkers++
            await this.processJob()
        }
    }

    private populateJobQueue = async (url: string | string[]): Promise<void> => {
        if (Array.isArray(url)) {
            const dedupedUrl = Array.from(new Set(url))
            dedupedUrl.forEach((link) => this.jobQueue.push(link))
        } else {
            this.jobQueue.push(url)
        }
    }

    private async processJob(): Promise<void> {
        if (this.jobQueue.length === 0) {
            return // No job in the queue to take.
        }
        const url = this.jobQueue.shift() as string
        let page = null
        try {
            if (this.crawlState.visited.has(url)) return

            this.crawlState.visited.add(url)
            this.crawlState.progress.total++
            this.crawlState.progress.inProgress++

            page = (await this.browser!.newPage()) as Page
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })

            console.log('Arrived at :>> ', url)

            // step 2. If we're crawling links, get all the links on the page and add them to the job queue.
            if (this.options.crawlLinks) {
                console.log('Crawl links')
                const links = await page.$$eval('a', (el: HTMLAnchorElement[]) =>
                    el.map((a) => a.href)
                )

                links.forEach((link) => {
                    if (!this.crawlState.visited.has(link) && this.options.crawlFilter(link)) {
                        this.jobQueue.push(link)
                    }
                })
            }

            const content = await this.runCallback(this.browser!, page)
            const metaTags = await page.$$eval('meta', (el: HTMLMetaElement[]) =>
                el
                    .map((meta) => ({
                        name: meta.getAttribute('name'),
                        content: meta.getAttribute('content'),
                    }))
                    .filter((meta) => meta.name && meta.content)
            )

            const payload = {
                url,
                content,
                metaTags,
            }

            this.results.push(payload)
            this.crawlState.progress.inProgress--
            this.crawlState.progress.completed++

            this.eventEmitter.emit('taskCompleted', payload)
        } catch (error) {
            this.eventEmitter.emit('taskError', error)
            throw new Error(`Error processing job: ${url}`)
        } finally {
            if (page) {
                // await page.close()
            }
        }
    }

    private checkQueue(): void {
        if (
            this.jobQueue.length === 0 &&
            this.crawlState.progress.inProgress === 0 &&
            this.activeWorkers === 0
        ) {
            this.eventEmitter.emit('allTasksCompleted')
        } else {
            this.spawnWorkers()
        }
    }
}

export default SiteCrawler

// Usage
// const crawler = new SiteCrawler({
//     options: {
//         crawlLinks: false,
//         crawlFilter: (url) => url.includes('framller'), // Will only crawl links that contain 'framer'
//     }, // We can pass in options here... OR we can pass them in the crawlSite method
// })

// await crawler.crawlSite({
//     url: [...],
//     run: (browser, page) => ({ wow: 'things being scraped'}),
//     listeners: {
//         onTaskComplete: (result) => console.log('Task completed', result),
//         onFinish: (results) => console.log('Finished scraping', results),
//          },
//     options: {
//         crawlLinks: true,
//         crawlFilter(url) {
//             return url.includes('framer')
//         },
//         puppeteerOptions: {
//             headless: false,
//             args: ['--no-sandbox', '--disable-setuid-sandbox'],
//             defaultViewport: {
//                 width: 1280,
//                 height: 20,
//             },
//         },
//     },
// })
