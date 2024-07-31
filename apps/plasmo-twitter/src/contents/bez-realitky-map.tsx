import type { PlasmoCSConfig } from "plasmo"
import { useCallback } from "react"

import { useBezRealitkySearch } from "~features/bez-realitky/hooks/use-bez-realitky-search"

export const config: PlasmoCSConfig = {
  matches: ["https://www.bezrealitky.com/*"],
  world: "MAIN"
}

const BezRealitkyMap = () => {
  const { mapLib } = useBezRealitkySearch()
  // .,18.16z
  const zoomToKarlin = useCallback(() => {
    if (mapLib) {
      mapLib.flyTo({
        center: [14.4504049, 50.0952836],
        zoom: 18,
        essential: true
      })
    }
  }, [mapLib])

  return (
    <button
      disabled={!mapLib}
      onClick={zoomToKarlin}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        zIndex: 9999
      }}>
      Take a Flight
    </button>
  )
}

export default BezRealitkyMap
