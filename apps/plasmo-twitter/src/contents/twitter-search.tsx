import type { PlasmoCSConfig } from "plasmo"

import { useTwitterSearch } from "../features/twitter/hooks/use-twitter-search"

export const config: PlasmoCSConfig = {
  matches: ["https://x.com/*"],
  world: "MAIN"
}

const TwitterSearch = () => {
  const { dmCount } = useTwitterSearch()
  return <div>Total DMs found: {dmCount}</div>
}

export default TwitterSearch
