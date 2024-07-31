import type { PlasmoCSConfig } from "plasmo"

import { useReactQuerySnifferSearch } from "~features/react-query-sniffer/hooks/use-react-query-sniffer-search"

// I'll leave this feature out for today, but check out the hook and SEARCH_CONFIG in the search-config.ts file for more details.
export const config: PlasmoCSConfig = {
  matches: ["https://DONOTUSE.com/*"],
  world: "MAIN"
}

const InspectorMode = () => {
  useReactQuerySnifferSearch()
  return null
}

export default InspectorMode
