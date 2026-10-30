import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import './filterPanel.css'

type FilterPanelProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
}

function FilterPanel({
  open,
  onClose,
  children,
}: FilterPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousOverflowRef = useRef<string | null>(null)

 useEffect(() => {
  const dialog = dialogRef.current

  return () => {
    dialog?.close()

    if (previousOverflowRef.current !== null) {
      document.body.style.overflow =
        previousOverflowRef.current

      previousOverflowRef.current = null
    }
  }
}, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    function finishClosing() {
      dialog?.close()
      dialog?.classList.remove('filter-panel-closing')

      if (previousOverflowRef.current !== null) {
        document.body.style.overflow =
          previousOverflowRef.current

        previousOverflowRef.current = null
      }
    }

    if (open) {
      dialog.classList.remove('filter-panel-closing')

      if (!dialog.open) {
        dialog.showModal()
      }

      if (previousOverflowRef.current === null) {
        previousOverflowRef.current =
          document.body.style.overflow

        document.body.style.overflow = 'hidden'
      }

      return
    }

    if (!dialog.open) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (reducedMotion) {
      finishClosing()
      return
    }

    dialog.classList.add('filter-panel-closing')

    function handleAnimationEnd(event: AnimationEvent) {
      if (
        event.target === dialog &&
        event.animationName === 'filter-panel-exit'
      ) {
        finishClosing()
      }
    }

    dialog.addEventListener(
      'animationend',
      handleAnimationEnd,
    )

    // Garante o fechamento mesmo se o navegador
    // não emitir o evento de término da animação.
    const timeout = window.setTimeout(finishClosing, 400)

    return () => {
      window.clearTimeout(timeout)
      dialog.removeEventListener(
        'animationend',
        handleAnimationEnd,
      )
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="filter-panel"
      aria-labelledby="filter-panel-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return

        const bounds =
          event.currentTarget.getBoundingClientRect()

        const clickedOutside =
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom

        if (clickedOutside) onClose()
      }}
    >
      <div className="filter-panel-content">
        <header className="filter-panel-header">
          <h2 id="filter-panel-title">Filtros</h2>

          <button
            type="button"
            className="filter-panel-close"
            aria-label="Fechar filtros"
            onClick={onClose}
            autoFocus
          >
            ×
          </button>
        </header>

        {children}
      </div>
    </dialog>
  )
}

export default FilterPanel