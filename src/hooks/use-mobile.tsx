
import * as React from "react"

// Define breakpoints for different device sizes
const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1280

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useDeviceSize() {
  const [deviceSize, setDeviceSize] = React.useState<"mobile" | "tablet" | "desktop" | undefined>(undefined)

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width < MOBILE_BREAKPOINT) {
        setDeviceSize("mobile")
      } else if (width < TABLET_BREAKPOINT) {
        setDeviceSize("tablet")
      } else {
        setDeviceSize("desktop")
      }
    }

    // Initial check
    handleResize()
    
    // Add event listener
    window.addEventListener("resize", handleResize)
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return deviceSize
}

export function useOrientation() {
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape" | undefined>(undefined)

  React.useEffect(() => {
    const handleOrientationChange = () => {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation("portrait")
      } else {
        setOrientation("landscape")
      }
    }

    // Initial check
    handleOrientationChange()
    
    // Add event listeners for both resize and orientation change
    window.addEventListener("resize", handleOrientationChange)
    window.addEventListener("orientationchange", handleOrientationChange)
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleOrientationChange)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  return orientation
}
