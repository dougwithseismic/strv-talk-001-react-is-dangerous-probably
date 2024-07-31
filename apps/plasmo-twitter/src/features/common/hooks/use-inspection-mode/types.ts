export interface ElementInfo {
  element: HTMLElement
  description: string
  domHandlers: Record<string, Function>
  reactHandlers: Record<string, Function>
  fiber: any
}

export interface UseReactInspectorReturn {
  isRecording: boolean
  isInspecting: boolean
  recordedEvents: ElementInfo[]
  currentInspectedNode: HTMLElement | Element | null
  toggleRecording: () => void
  toggleInspection: () => void
  triggerEventHandler: (
    elementInfo: ElementInfo,
    eventName: string,
    mockEvent?: any
  ) => void
  createMockEvent: (type?: string, options?: object) => MouseEvent
  showHelp: () => void
  clearConsole: () => void
}
