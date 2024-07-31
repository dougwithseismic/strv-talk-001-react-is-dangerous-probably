import { type StructuredSearchCriteria } from "~features/common/utility/search-react-fiber"

const SEARCH_CRITERIA: StructuredSearchCriteria[] = [
  {
    label: "React Query",
    criteria: [
      {
        client: { queryCache: true },
        useQuery: { queryKey: true, queryFn: true },
        useMutation: { mutationFn: true }
      }
    ]
  },
  {
    label: "Redux",
    criteria: [
      {
        store: { createStore: true },
        actions: { type: true },
        reducers: { state: true, action: true }
      }
    ]
  },
  {
    label: "MobX",
    criteria: [
      {
        observable: { makeObservable: true },
        action: { runInAction: true },
        computed: { makeAutoObservable: true }
      }
    ]
  },
  {
    label: "Recoil",
    criteria: [
      {
        atom: { key: true, default: true },
        selector: { get: true, set: true },
        useRecoilState: true
      }
    ]
  },
  {
    label: "Zustand",
    criteria: [
      {
        create: { setState: true, getState: true },
        useStore: true
      }
    ]
  },
  {
    label: "Jotai",
    criteria: [
      {
        atom: { init: true },
        useAtom: true,
        atomFamily: true
      }
    ]
  }
]

export const SEARCH_CONFIG = {
  searchCriteria: SEARCH_CRITERIA.flatMap((group) => group.criteria),
  maxDepth: 50,
  stopAfterFirst: true,
  searchPaths: ["memoizedProps", "memoizedState"],
  mainSelector: "#react-root"
}
