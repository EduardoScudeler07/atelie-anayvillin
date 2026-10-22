import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import './filterPanel.css'

type FilterPanelProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
}

function FilterPanel({ open, onClose, children }: FilterPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
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

        const bounds = event.currentTarget.getBoundingClientRect()
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