import filterMask from "./filterMask"
import watchMask from "./watchMask"

interface Event {
    target: {value?: string}
    which?: number
    keyCode: number
    kc: number
    preventDefault: () => void
}

export interface PhoneMask {
    filterMask: (value: string, evnt: Event, onChanged: (newValue: string) => void) => void
    watchMask: (value: string, onChanged: (newValue: string) => void) => void
} 

const mask: PhoneMask = { 
    filterMask: filterMask,
    watchMask: watchMask
}

export default mask