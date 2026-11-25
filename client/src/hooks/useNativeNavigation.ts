import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'

export function useNativeNavigation() {
  useEffect(() => {
    const platform = Capacitor.getPlatform()
    let cancelled = false
    let backListener: Awaited<ReturnType<typeof CapacitorApp.addListener>> | undefined

    if (platform === 'android') {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back()
        } else {
          void CapacitorApp.exitApp()
        }
      }).then((listener) => {
        if (cancelled) void listener.remove()
        else backListener = listener
      })
    }

    let startX = 0
    let startY = 0
    let tracking = false

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length !== 1) return
      const touch = event.touches[0]
      if (touch.clientX > 24) return
      tracking = true
      startX = touch.clientX
      startY = touch.clientY
    }

    function onTouchMove(event: TouchEvent) {
      if (!tracking || event.touches.length !== 1) return
      const touch = event.touches[0]
      const deltaX = touch.clientX - startX
      const deltaY = Math.abs(touch.clientY - startY)
      if (deltaX > 48 && deltaX > deltaY * 1.5) {
        tracking = false
        window.history.back()
      }
    }

    function onTouchEnd() {
      tracking = false
    }

    if (platform === 'ios') {
      document.addEventListener('touchstart', onTouchStart, { passive: true })
      document.addEventListener('touchmove', onTouchMove, { passive: true })
      document.addEventListener('touchend', onTouchEnd, { passive: true })
      document.addEventListener('touchcancel', onTouchEnd, { passive: true })
    }

    return () => {
      cancelled = true
      if (backListener) void backListener.remove()
      if (platform === 'ios') {
        document.removeEventListener('touchstart', onTouchStart)
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
        document.removeEventListener('touchcancel', onTouchEnd)
      }
    }
  }, [])
}
