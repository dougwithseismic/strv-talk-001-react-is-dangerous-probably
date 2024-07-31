import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useMemo, useState } from "react"

import { useInspectorMode } from "~features/common/hooks/use-inspection-mode"
import { useRohlikSearch } from "~features/rohlik/hooks/use-rohlik-search"

export const config: PlasmoCSConfig = {
  matches: ["https://www.rohlik.cz/*"],
  world: "MAIN"
}

const RohlikUserDetails = () => {
  const { userDetails, matchedObjects, redoSearch } = useRohlikSearch()
  const [isMinimized, setIsMinimized] = useState(false)

  const formattedUserDetails = useMemo(() => {
    return JSON.stringify(userDetails, null, 2)
  }, [userDetails])

  console.log("matchedObjects", matchedObjects)

  const makeClientAdmin = () => {
    console.log("makeClientAdmin")
    matchedObjects.forEach((object) => {
      if (object.fiberNode.pendingProps.value?.userInfo) {
        const userInfo = object.fiberNode.pendingProps.value.userInfo
        userInfo.isAdmin = true

        userInfo.isParentsClub = true
        userInfo.user.star = true
        userInfo.user.parentsClub = true
        userInfo.user.email = "admin@rohlik.cz"
        userInfo.user.name = "Admin"
        userInfo.user.credits = 9999999
      }
    })
    redoSearch()
  }

  const toggleMinimize = () => setIsMinimized(!isMinimized)

  if (isMinimized) {
    return (
      <button
        onClick={toggleMinimize}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 9999
        }}>
        Show Rohlik User Details
      </button>
    )
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        position: "fixed",
        bottom: "20px",
        right: "20px",
        backgroundColor: "white",
        padding: "20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "4px",
        zIndex: 9999
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px"
        }}>
        <h2
          style={{
            color: "#333",
            margin: 0
          }}>
          Rohlik User Details
        </h2>
        <button
          onClick={toggleMinimize}
          style={{
            backgroundColor: "#f8f9fa",
            color: "#333",
            border: "1px solid #ddd",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer"
          }}>
          Minimize
        </button>
      </div>
      <button
        onClick={makeClientAdmin}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "15px"
        }}>
        Make Admin
      </button>
      <pre
        style={{
          backgroundColor: "#f8f9fa",
          border: "1px solid #eee",
          borderRadius: "4px",
          padding: "15px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "14px",
          maxHeight: "300px",
          overflowY: "auto"
        }}>
        {formattedUserDetails}
      </pre>
    </div>
  )
}

export default RohlikUserDetails
