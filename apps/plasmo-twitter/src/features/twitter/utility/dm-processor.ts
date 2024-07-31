import { type Dispatch, type SetStateAction } from "react"

import { type DMData } from "./types"

export const processDMs = (
  DMs: any,
  setDmCount: Dispatch<SetStateAction<number>>
): boolean => {
  const entries = Object.entries(DMs.entries.entries)
  if (entries.length === 0) {
    console.log("DMs object found, but it's empty. Will retry.")
    return false
  }

  console.log("DMs found and populated:")
  setDmCount(entries.length)
  console.log(`Total DMs found: ${entries.length}`)
  entries.forEach(([, value]: [string, { data: DMData }]) => {
    switch (value.data.type) {
      case "message":
        console.log(value.data.message_data?.text)
        break
      case "reaction_create":
        console.log(value.data.message_data?.emoji_reaction)
        break
      default:
        console.log("No text found in DM", value.data)
    }
  })
  return true
}
