import { useCallback, useEffect, useRef, useState } from "react"

import { searchReactFiber } from "~features/common/utility/search-react-fiber"

import { SEARCH_CONFIG } from "../search-config"
import { processDMs } from "../utility/dm-processor"

export const useTwitterSearch = () => {
  const hasSearched = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [dmCount, setDmCount] = useState(0)
  const searchExecuted = useRef(false)

  const searchCallback = useCallback((matchingObjects) => {
    let DMsFound = false

    matchingObjects.slice(0, 1).forEach(({ matchingObject }) => {
      if (matchingObject.getState) {
        const DMs = matchingObject.getState().directMessages
        console.log("DMs :>> ", DMs)
        try {
          DMsFound = processDMs(DMs, setDmCount)
        } catch (error) {
          console.error("Error processing DMs:", error)
        }
      }
    })

    return DMsFound
  }, [])

  const executeSearch = useCallback(() => {
    console.time("Search time")
    const matchingObjects = searchReactFiber({
      ...SEARCH_CONFIG,
      callback: searchCallback
    })
    console.timeEnd("Search time")
    console.log(`Found ${matchingObjects.length} matching objects`)

    return searchCallback(matchingObjects)
  }, [searchCallback])

  const executeSearchWithRetry = useCallback(
    (maxRetries = 30, delay = 2000) => {
      if (hasSearched.current) return
      hasSearched.current = true

      let retryCount = 0

      abortControllerRef.current = new AbortController()
      const { signal } = abortControllerRef.current

      const attemptSearch = () => {
        if (signal.aborted) return

        const DMsFound = executeSearch()

        if (DMsFound) {
          console.log(
            `Search successful after ${retryCount} retries. DMs found and processed.`
          )
          abortControllerRef.current?.abort()
        } else if (retryCount < maxRetries) {
          retryCount++
          console.log(
            `DMs not found or empty. Retrying (${retryCount}/${maxRetries})...`
          )
          setTimeout(() => {
            if (!signal.aborted) attemptSearch()
          }, delay)
        } else {
          console.log(
            `Max retries (${maxRetries}) reached. DMs not found or always empty.`
          )
        }
      }

      attemptSearch()
    },
    [executeSearch]
  )

  useEffect(() => {
    if (searchExecuted.current) return

    const executeSearch = () => {
      if (searchExecuted.current) return
      searchExecuted.current = true
      console.log("#react-root found. Starting search...")
      executeSearchWithRetry()
    }

    const observer = new MutationObserver((mutations, obs) => {
      const reactRoot = document.querySelector("#react-root")
      if (reactRoot) {
        executeSearch()
        obs.disconnect()
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    })

    if (document.querySelector("#react-root")) {
      executeSearch()
    }

    return () => {
      observer.disconnect()
      abortControllerRef.current?.abort()
    }
  }, [executeSearchWithRetry])

  return { executeSearchWithRetry, dmCount }
}
