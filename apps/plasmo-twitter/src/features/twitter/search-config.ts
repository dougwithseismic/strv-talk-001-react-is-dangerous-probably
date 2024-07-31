import { type StructuredSearchCriteria } from "~features/common/utility/search-react-fiber"

const SEARCH_CRITERIA: StructuredSearchCriteria[] = [
  {
    label: "Twitter State",
    criteria: [{ getState: true }]
  }
]

export const SEARCH_CONFIG = {
  searchCriteria: SEARCH_CRITERIA.flatMap((group) => group.criteria),
  maxDepth: 50,
  stopAfterFirst: true,
  searchPaths: ["memoizedProps", "memoizedState"],
  mainSelector: "#react-root"
}
