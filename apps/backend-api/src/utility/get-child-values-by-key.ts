// helper to filter childValues by a key string
const getChildValuesByKey = (key: string, childValues: { [key: string]: any }) => {
    const filtered = Object.keys(childValues)
        .filter((k) => k.includes(key))
        .map((filteredKey) => childValues[filteredKey])

    return filtered
}

export { getChildValuesByKey }
