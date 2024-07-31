import { useCallback, useEffect, useRef, useState } from "react"

import { searchReactFiber } from "~features/common/utility/search-react-fiber"

import { SEARCH_CONFIG } from "../search-config"

export const useBezRealitkySearch = () => {
  const hasSearched = useRef(false)
  const [matchedObjects, setMatchedObjects] = useState<any>([])
  const [mapLib, setMapLib] = useState<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchExecuted = useRef(false)

  const searchCallback = useCallback((matchingObjects) => {
    let mapLib = null
    matchingObjects.slice(0, 1).forEach(({ matchingObject }) => {
      // Lets find mapLib
      if (matchingObject.getMap) {
        mapLib = matchingObject.getMap()
        // @ts-ignore
        window.map = mapLib
        setMapLib(mapLib)
      }
    })

    return mapLib
  }, [])

  const executeSearch = useCallback(() => {
    console.time("Search time")
    const matchingObjects = searchReactFiber({
      ...SEARCH_CONFIG,
      callback: searchCallback
    })
    console.timeEnd("Search time")
    console.log(`Found ${matchingObjects.length} matching objects`)
    setMatchedObjects(matchingObjects)

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

        const payload = executeSearch()

        if (payload) {
          console.log(
            `Search successful after ${retryCount} retries. Payload found and processed.`
          )
          abortControllerRef.current?.abort()
        } else if (retryCount < maxRetries) {
          retryCount++
          console.log(
            `State not found or empty. Retrying (${retryCount}/${maxRetries})...`
          )
          setTimeout(() => {
            if (!signal.aborted) attemptSearch()
          }, delay)
        } else {
          console.log(
            `Max retries (${maxRetries}) reached. Payload not found or always empty.`
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
      console.log(`${SEARCH_CONFIG.mainSelector} found. Starting search...`)
      executeSearchWithRetry()
    }

    const observer = new MutationObserver((mutations, obs) => {
      const reactRoot = document.querySelector(SEARCH_CONFIG.mainSelector)
      if (reactRoot) {
        executeSearch()
        obs.disconnect()
      }
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    })

    if (document.querySelector(SEARCH_CONFIG.mainSelector)) {
      executeSearch()
    }

    return () => {
      observer.disconnect()
      abortControllerRef.current?.abort()
    }
  }, [executeSearchWithRetry])

  const redoSearch = useCallback(() => {
    hasSearched.current = false
    searchExecuted.current = false
    abortControllerRef.current?.abort()
    executeSearchWithRetry()
  }, [executeSearchWithRetry])

  return { executeSearchWithRetry, matchedObjects, redoSearch, mapLib }
}
