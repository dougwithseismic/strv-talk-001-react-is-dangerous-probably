interface SearchCriteria {
  [key: string]: SearchCriteria | boolean
}

interface StructuredSearchCriteria {
  label: string
  criteria: SearchCriteria[]
}

interface SearchConfig {
  searchCriteria: SearchCriteria[]
  maxDepth: number
  stopAfterFirst: boolean
  searchPaths: string[]
  mainSelector: string
  callback?: (
    matchingObjects: {
      matchingObject: any
      fiberNode: any
      criteriaIndex: number
    }[]
  ) => void
}

// Create a WeakSet to keep track of patched objects
const patchedObjects = new WeakSet()

// Safe monkey patching function
function monkeyPatch(obj, prop, callback) {
  // Check if the object has already been patched
  if (patchedObjects.has(obj)) {
    console.log(`Object containing ${prop} has already been patched. Skipping.`)
    return
  }

  const originalFunc = obj[prop]

  // Check if the function has already been patched
  if (originalFunc.WS_PATCHED) {
    console.log(`Function ${prop} has already been patched. Skipping.`)
    return
  }

  obj[prop] = function (...args) {
    const result = originalFunc.apply(this, args)

    // Log arguments
    console.log(`${prop} called with args:`, args)

    // Handle promises
    if (result && typeof result.then === "function") {
      result.then(
        (value) => {
          console.log(`${prop} resolved with:`, value)
          callback(prop, args, value)
        },
        (error) => {
          console.log(`${prop} rejected with:`, error)
          callback(prop, args, null, error)
        }
      )
    } else {
      console.log(`${prop} returned:`, result)
      callback(prop, args, result)
    }

    return result
  }

  obj[prop].WS_PATCHED = true

  // Mark the object as patched
  patchedObjects.add(obj)
}

// Main function to search the React Fiber tree
function searchReactFiber(config: SearchConfig) {
  if (!config) {
    console.error("No search configuration provided")
    return []
  }
  const results = []
  const visitedNodes = new WeakSet()

  // Helper function to safely access object properties
  function safelyAccessProperty(obj, prop) {
    try {
      return obj[prop]
    } catch (error) {
      if (error instanceof DOMException && error.name === "SecurityError") {
        return null // Silently skip security-restricted properties
      }
      throw error
    }
  }

  // Check if an object contains all keys from the criteria
  function isMatchingObject(obj, criteria) {
    if (typeof obj !== "object" || obj === null) return false

    return Object.entries(criteria).every(([key, value]) => {
      const objValue = safelyAccessProperty(obj, key)
      if (objValue === null || objValue === undefined) return false

      if (typeof value === "object" && value !== null) {
        return isMatchingObject(objValue, value)
      } else if (value === true) {
        return true
      } else {
        return objValue === value
      }
    })
  }

  // Check if an object matches any of the criteria
  function matchesAnyCriteria(obj, criteriaArray) {
    for (let i = 0; i < criteriaArray.length; i++) {
      if (isMatchingObject(obj, criteriaArray[i])) {
        return { matched: true, index: i }
      }
    }
    return { matched: false, index: -1 }
  }

  // Traverse the Fiber tree
  function traverseFiberTree(startNode) {
    const stack = [{ node: startNode, depth: 0 }]

    while (stack.length > 0) {
      const { node, depth } = stack.pop()

      if (
        !node ||
        typeof node !== "object" ||
        depth > config.maxDepth ||
        visitedNodes.has(node)
      ) {
        continue
      }

      visitedNodes.add(node)

      // Check if the node or its stateNode has already been patched
      if (
        patchedObjects.has(node) ||
        (node.stateNode && patchedObjects.has(node.stateNode))
      ) {
        console.log("Skipping already patched node or its stateNode")
        continue
      }

      // Check searchPaths for matching objects
      for (const propName of config.searchPaths) {
        const propValue = safelyAccessProperty(node, propName)
        if (propValue && typeof propValue === "object") {
          const match = matchesAnyCriteria(propValue, config.searchCriteria)
          if (match.matched) {
            results.push({
              matchingObject: propValue,
              fiberNode: node,
              criteriaIndex: match.index
            })
            if (config.stopAfterFirst) return results
          }
          // Search nested objects in memoizedProps and memoizedState
          if (propName === "memoizedProps" || propName === "memoizedState") {
            searchNestedObjects(propValue, node)
          }
        }
      }

      // Add child and sibling nodes to the stack
      const child = safelyAccessProperty(node, "child")
      if (child) stack.push({ node: child, depth: depth + 1 })

      const sibling = safelyAccessProperty(node, "sibling")
      if (sibling) stack.push({ node: sibling, depth })
    }
  }

  // Search nested objects within a node
  function searchNestedObjects(obj, fiberNode) {
    const stack = [obj]
    const visited = new WeakSet()

    while (stack.length > 0) {
      const current = stack.pop()

      if (
        typeof current !== "object" ||
        current === null ||
        visited.has(current)
      ) {
        continue
      }

      visited.add(current)

      const match = matchesAnyCriteria(current, config.searchCriteria)
      if (match.matched) {
        results.push({
          matchingObject: current,
          fiberNode,
          criteriaIndex: match.index
        })
        if (config.stopAfterFirst) return
      }

      // Push all nested objects onto the stack
      Object.values(current).forEach((value) => {
        if (
          typeof value === "object" &&
          value !== null &&
          !visited.has(value)
        ) {
          stack.push(value)
        }
      })
    }
  }

  // Get the root fiber node
  const main = document.querySelector(config.mainSelector)
  if (!main) {
    console.warn(`Main element not found with selector: ${config.mainSelector}`)
    return results
  }

  const fiberKey = Object.keys(main).find((key) => key.startsWith("__react"))
  if (!fiberKey) {
    console.warn(
      "React fiber key not found. This may not be a React application or the fiber structure has changed."
    )
    return results
  }

  const fiberNode = safelyAccessProperty(main, fiberKey)
  if (!fiberNode) {
    console.warn("Unable to access fiber node. Skipping search.")
    return results
  }

  // Start the search
  traverseFiberTree(fiberNode)

  // Call the callback function if provided
  if (typeof config.callback === "function") {
    config.callback(results)
  }

  return results
}

// Helper function to force rerender a component
function forceRerender(fiber) {
  while (fiber && !fiber.stateNode?.forceUpdate) {
    fiber = fiber.return
  }

  if (fiber && fiber.stateNode) {
    fiber.stateNode.forceUpdate()
  }
}

export { searchReactFiber, monkeyPatch }
export type { SearchCriteria, StructuredSearchCriteria }
