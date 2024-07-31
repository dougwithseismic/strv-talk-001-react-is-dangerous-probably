import type { PlasmoCSConfig } from "plasmo"

import { useInspectorMode } from "~features/common/hooks/use-inspection-mode"

export const config: PlasmoCSConfig = {
  //   matches: ["https://**/*"],
  world: "MAIN"
}

const InspectorMode = () => {
  useInspectorMode()

  return null
}

export default InspectorMode
