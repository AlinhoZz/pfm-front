import { toast as baseToast } from "sonner"

type ToastAction = {
  label: string
  onClick: () => void
}

export type ToastOptions = {
  title?: string
  description?: string
  action?: ToastAction
  duration?: number
  kind?: "success" | "error" | "info"
}

export function useToast() {
  const toast = ({ title, description, action, duration }: ToastOptions = {}) =>
    baseToast(title ?? description ?? "", {
      description,
      duration,
      action: action ? { label: action.label, onClick: action.onClick } : undefined,
    })

  const success = (opts: ToastOptions | string) =>
    typeof opts === "string"
      ? baseToast.success(opts)
      : baseToast.success(opts.title ?? opts.description ?? "", {
          description: opts.description,
          duration: opts.duration,
          action: opts.action ? { label: opts.action.label, onClick: opts.action.onClick } : undefined,
        })

  const error = (opts: ToastOptions | string) =>
    typeof opts === "string"
      ? baseToast.error(opts)
      : baseToast.error(opts.title ?? opts.description ?? "", {
          description: opts.description,
          duration: opts.duration,
          action: opts.action ? { label: opts.action.label, onClick: opts.action.onClick } : undefined,
        })

  const show = (opts: ToastOptions) => {
    if (opts.kind === "success") return success(opts)
    if (opts.kind === "error") return error(opts)
    return toast(opts)
  }

  return { toast, success, error, show }
}
