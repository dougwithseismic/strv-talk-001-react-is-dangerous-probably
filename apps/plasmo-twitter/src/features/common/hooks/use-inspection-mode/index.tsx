import { useCallback, useEffect, useRef, useState } from "react"

import { KEY_SEARCHES, SHORTCUTS } from "./consts"
import { type ElementInfo, type UseReactInspectorReturn } from "./types"

export const useInspectorMode = (): UseReactInspectorReturn => {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isInspecting, setIsInspecting] = useState<boolean>(false)
  const [recordedEvents, setRecordedEvents] = useState<ElementInfo[]>([])
  const [currentInspectedNode, setCurrentInspectedNode] = useState<
    HTMLElement | Element | null
  >(null)
  const previousInspectedNode = useRef<HTMLElement | Element | null>(null)

  const getReactFiber = (element: HTMLElement): any => {
    const key = Object.keys(element).find(
      (key) =>
        key.startsWith("__react") || key.startsWith("__reactInternalInstance$")
    )
    return key ? (element as any)[key] : null
  }

  const safeStringify = (func: Function): string => {
    try {
      return (
        func.toString().slice(0, 100) +
        (func.toString().length > 100 ? "..." : "")
      )
    } catch (error) {
      return `[Function that couldn't be stringified: ${error.message}]`
    }
  }

  const getElementDescription = (element: HTMLElement): string => {
    return `<${element.tagName.toLowerCase()}${element.id ? ' id="' + element.id + '"' : ""}${element.className ? ' class="' + element.className + '"' : ""}>`
  }

  const updateElementOutline = useCallback(
    (
      element: HTMLElement | Element | null,
      isInspected: boolean,
      isSpecial: boolean = false
    ) => {
      if (element) {
        const htmlElement = element as HTMLElement
        htmlElement.style.outline = isInspected ? "2px solid #FF4081" : ""
        htmlElement.style.backgroundColor = isSpecial
          ? "rgba(0, 0, 255, 0.1)"
          : isInspected
            ? "rgba(255, 0, 0, 0.1)"
            : ""
        htmlElement.style.transition = "background-color 0.3s ease"
      }
    },
    []
  )

  const inspectElementOnHover = useCallback((target: HTMLElement) => {
    updateElementOutline(previousInspectedNode.current, false)

    const elementInfo = inspectElement(target)
    const memoizedProps = elementInfo.fiber?.memoizedProps
    const memoizedState = elementInfo.fiber?.memoizedState

    const isSpecialElement = KEY_SEARCHES.some((search) =>
      search.keys.every((key) => memoizedProps && key in memoizedProps)
    )

    updateElementOutline(target, true, isSpecialElement)

    setCurrentInspectedNode(target)
    previousInspectedNode.current = target

    if (
      Object.keys(elementInfo.domHandlers).length > 0 ||
      Object.keys(elementInfo.reactHandlers).length > 0 ||
      isSpecialElement ||
      true
    ) {
      console.clear()
      console.group("%cInspected Element:", "color: purple; font-weight: bold;")
      console.log("Element Info:", target)
      console.log("Memoized Props:", memoizedProps)
      console.log(
        "%cDetailed Props and State:",
        "color: blue; font-weight: bold;"
      )
      console.table(
        Object.entries({
          ...memoizedProps,
          ...memoizedState
        }).reduce((acc, [key, value]) => {
          acc[key] = {
            value: typeof value === "object" ? JSON.stringify(value) : value,
            type: typeof value
          }
          return acc
        }, {})
      )

      const drillDown = (obj, prefix = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            console.group(`${prefix}${key}:`)
            drillDown(value, `${prefix}  `)
            console.groupEnd()
          } else {
            console.log(`${prefix}${key}:`, value)
          }
        })
      }

      console.group(
        "%cDrillable Props and State:",
        "color: green; font-weight: bold;"
      )
      drillDown({ ...memoizedProps, ...memoizedState })
      console.groupEnd()
      console.log("Memoized State:", memoizedState)

      // Move key search to the drillable section
      KEY_SEARCHES.forEach((search) => {
        if (search.keys.every((key) => memoizedProps && key in memoizedProps)) {
          console.group(
            `%c${search.label} (Special Element Detected):`,
            "color: aqua; font-weight: bold;"
          )
          drillDown(
            search.keys.reduce((acc, key) => {
              acc[key] = memoizedProps[key]
              return acc
            }, {})
          )
          console.groupEnd()
        }
      })
    }
  }, [])

  const navigateUp = useCallback(() => {
    if (currentInspectedNode) {
      const parentElement = currentInspectedNode.parentElement
      if (parentElement) {
        inspectElementOnHover(parentElement)
      }
    }
  }, [currentInspectedNode, inspectElementOnHover])

  const navigateDown = useCallback(() => {
    if (currentInspectedNode) {
      const firstChild = currentInspectedNode.firstElementChild
      if (firstChild) {
        inspectElementOnHover(firstChild as HTMLElement)
      }
    }
  }, [currentInspectedNode, inspectElementOnHover])

  const navigateLeft = useCallback(() => {
    if (currentInspectedNode) {
      const previousSibling = currentInspectedNode.previousElementSibling
      if (previousSibling) {
        inspectElementOnHover(previousSibling as HTMLElement)
      }
    }
  }, [currentInspectedNode, inspectElementOnHover])

  const navigateRight = useCallback(() => {
    if (currentInspectedNode) {
      const nextSibling = currentInspectedNode.nextElementSibling
      if (nextSibling) {
        inspectElementOnHover(nextSibling as HTMLElement)
      }
    }
  }, [currentInspectedNode, inspectElementOnHover])

  const inspectElement = (element: HTMLElement): ElementInfo => {
    const fiber = getReactFiber(element)
    let reactHandlers: Record<string, Function> = {}
    let domHandlers: Record<string, Function> = {}

    // Inspect DOM event handlers
    for (let prop in element) {
      if (
        prop.startsWith("on") &&
        typeof (element as any)[prop] === "function"
      ) {
        domHandlers[prop] = (element as any)[prop]
      }
    }

    // Inspect React event handlers
    if (fiber) {
      let current = fiber
      while (current) {
        if (current.memoizedProps) {
          for (let prop in current.memoizedProps) {
            if (
              prop.startsWith("on") &&
              typeof current.memoizedProps[prop] === "function"
            ) {
              reactHandlers[prop] = current.memoizedProps[prop]
            }
          }
        }
        current = current.return
      }
    }

    return {
      element,
      description: getElementDescription(element),
      domHandlers,
      reactHandlers,
      fiber
    }
  }

  const toggleRecording = useCallback(() => {
    setIsRecording((prev) => !prev)
  }, [])

  const toggleInspection = useCallback(() => {
    setIsInspecting((prev) => !prev)
  }, [])

  const triggerEventHandler = useCallback(
    (elementInfo: ElementInfo, eventName: string, mockEvent: any = {}) => {
      console.log(`Triggering ${eventName} for:`, elementInfo.description)

      if (elementInfo.reactHandlers[eventName]) {
        console.log(`Calling React ${eventName} handler...`)
        elementInfo.reactHandlers[eventName](mockEvent)
      } else if (elementInfo.domHandlers[eventName]) {
        console.log(`Calling DOM ${eventName} handler...`)
        elementInfo.domHandlers[eventName].call(elementInfo.element, mockEvent)
      } else {
        console.log(`No ${eventName} handler found to trigger.`)
      }
    },
    []
  )

  const createMockEvent = useCallback(
    (type: string = "click", options: object = {}) => {
      return new MouseEvent(type, {
        view: window,
        bubbles: true,
        cancelable: true,
        ...options
      })
    },
    []
  )

  const showHelp = () => {
    console.clear()
    console.log(
      "%cInteractive Event Inspector with Visual Overlay - Help",
      "color: #4CAF50; font-weight: bold; font-size: 16px;"
    )
    console.log("%cAvailable Controls:", "color: #2196F3; font-weight: bold;")
    console.log(`${SHORTCUTS.TOGGLE_RECORDING}: Toggle recording mode`)
    console.log(
      `${SHORTCUTS.TOGGLE_INSPECTION}: Toggle mouse-over inspection mode with visual overlay`
    )
    console.log("\nWhile in inspection mode:")
    console.log(`${SHORTCUTS.NAVIGATE_UP}: Navigate to parent`)
    console.log(`${SHORTCUTS.NAVIGATE_DOWN}: Navigate to first child`)
    console.log(`${SHORTCUTS.NAVIGATE_LEFT}: Navigate to previous sibling`)
    console.log(`${SHORTCUTS.NAVIGATE_RIGHT}: Navigate to next sibling`)
    console.log(`\n${SHORTCUTS.SHOW_HELP}: Show this help message`)
    console.log(`${SHORTCUTS.CLEAR_CONSOLE}: Clear the console`)
    console.log("\nAdditional Functions:")
    console.log(
      "triggerEventHandler(elementInfo, eventName, mockEvent): Manually trigger a recorded event handler"
    )
    console.log(
      "\n%cTip: When inspecting, you can right-click on the logged DOM Node or React Fiber to save it as a temporary variable in the console.",
      "color: #FFA500; font-weight: bold;"
    )
    console.log(
      "%cNote: The currently inspected element is now highlighted with an outline on the page.",
      "color: #FF4081; font-weight: bold;"
    )
    console.log(
      "%cSpecial elements with specific keys are highlighted in blue.",
      "color: blue; font-weight: bold;"
    )
  }

  const clearConsole = () => {
    console.clear()
    console.log(
      "%cConsole cleared. Press h for help.",
      "color: #4CAF50; font-weight: bold;"
    )
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case SHORTCUTS.TOGGLE_RECORDING:
          toggleRecording()
          break
        case SHORTCUTS.TOGGLE_INSPECTION:
          toggleInspection()
          break
        case SHORTCUTS.SHOW_HELP:
          showHelp()
          break
        case SHORTCUTS.CLEAR_CONSOLE:
          clearConsole()
          break
        case SHORTCUTS.NAVIGATE_UP:
          navigateUp()
          break
        case SHORTCUTS.NAVIGATE_DOWN:
          navigateDown()
          break
        case SHORTCUTS.NAVIGATE_LEFT:
          navigateLeft()
          break
        case SHORTCUTS.NAVIGATE_RIGHT:
          navigateRight()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    toggleRecording,
    toggleInspection,
    navigateUp,
    navigateDown,
    navigateLeft,
    navigateRight
  ])

  useEffect(() => {
    if (isRecording) {
      const recordEvent = (event: MouseEvent) => {
        const elementInfo = inspectElement(event.target as HTMLElement)
        setRecordedEvents((prev) => [...prev, elementInfo])
        console.log("%cNew event recorded:", "color: blue; font-weight: bold;")
        console.log(elementInfo)
      }

      document.addEventListener("click", recordEvent, true)
      console.log(
        "%cRecording started. Click on elements to record their events.",
        "color: green; font-weight: bold;"
      )

      return () => {
        document.removeEventListener("click", recordEvent, true)
        console.log(
          "%cRecording stopped. Total recorded events:",
          "color: red; font-weight: bold;",
          recordedEvents.length
        )
      }
    }
  }, [isRecording, recordedEvents.length])

  useEffect(() => {
    if (isInspecting) {
      const handleMouseOver = (event: MouseEvent) => {
        inspectElementOnHover(event.target as HTMLElement)
      }

      document.addEventListener("mouseover", handleMouseOver, true)
      console.log(
        "%cInspection mode started. Mouse over elements to see their event details.",
        "color: purple; font-weight: bold;"
      )

      return () => {
        document.removeEventListener("mouseover", handleMouseOver, true)
        updateElementOutline(currentInspectedNode, false)
        setCurrentInspectedNode(null)
        previousInspectedNode.current = null
        console.log(
          "%cInspection mode stopped.",
          "color: purple; font-weight: bold;"
        )
      }
    } else {
      updateElementOutline(currentInspectedNode, false)
      setCurrentInspectedNode(null)
      previousInspectedNode.current = null
    }
  }, [isInspecting, inspectElementOnHover, updateElementOutline])

  return {
    isRecording,
    isInspecting,
    recordedEvents,
    currentInspectedNode,
    toggleRecording,
    toggleInspection,
    triggerEventHandler,
    createMockEvent,
    showHelp,
    clearConsole
  }
}
