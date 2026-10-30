import { useEffect, useRef } from 'react'

export function useHomeReveal() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current

    if (
      !root ||
      !('IntersectionObserver' in window) ||
      typeof root.animate !== 'function'
    ) {
      return
    }

    const motionPreference = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )

    if (motionPreference.matches) return

    const selector = [
      '.collections-heading',
      '.story-content',
      '.customization-content',
      '.customization-image',
      '.how-to-order-heading',
      '.how-to-order-step',
    ].join(', ')

    const elements = root.querySelectorAll<HTMLElement>(
      selector,
    )

    const animations = new Set<Animation>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue

          const element = entry.target as HTMLElement

          observer.unobserve(element)

          if (
            motionPreference.matches ||
            element.contains(document.activeElement)
          ) {
            continue
          }

          const isImage = element.matches(
            '.customization-image',
          )

          try {
            const animation = element.animate(
              [
                {
                  opacity: isImage ? 0.85 : 0.65,
                  transform: 'translateY(6px)',
                },
                {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              ],
              {
                duration: 900,
                easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
              },
            )

            animations.add(animation)

            animation.finished.then(
              () => animations.delete(animation),
              () => animations.delete(animation),
            )
          } catch {
            // Sem animação, o conteúdo permanece visível.
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '0px',
      },
    )

    for (const element of elements) {
      const bounds = element.getBoundingClientRect()

      if (bounds.top < window.innerHeight) continue

      observer.observe(element)
    }

    function handleMotionChange() {
      if (!motionPreference.matches) return

      observer.disconnect()

      for (const animation of animations) {
        animation.cancel()
      }

      animations.clear()
    }

    motionPreference.addEventListener(
      'change',
      handleMotionChange,
    )

    return () => {
      observer.disconnect()

      motionPreference.removeEventListener(
        'change',
        handleMotionChange,
      )

      for (const animation of animations) {
        animation.cancel()
      }

      animations.clear()
    }
  }, [])

  return rootRef
}