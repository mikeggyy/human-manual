import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = '先保留', onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current!
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [open])

  return createPortal(<dialog ref={dialogRef} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onCancel() }} onKeyDown={(event) => {
    if (event.key !== 'Tab') return
    if (event.shiftKey && document.activeElement === cancelRef.current) {
      event.preventDefault(); confirmRef.current?.focus()
    } else if (!event.shiftKey && document.activeElement === confirmRef.current) {
      event.preventDefault(); cancelRef.current?.focus()
    }
  }}>
    <div className="ornament" aria-hidden="true"><span>✽</span></div>
    <h2 id={titleId}>{title}</h2>
    <p id={descriptionId}>{description}</p>
    <div className="confirm-dialog-actions">
      <button ref={cancelRef} type="button" className="button button-secondary" onClick={onCancel}>{cancelLabel}</button>
      <button ref={confirmRef} type="button" className="button button-primary" onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </dialog>, document.body)
}
