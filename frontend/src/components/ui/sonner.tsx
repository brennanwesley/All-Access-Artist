/**
 * Toast Notification System
 * All Access Artist - Frontend v2.0.0
 * 
 * Global toast notification component using sonner
 * Configured to match application theme and shadcn/ui styling
 */
import { Toaster as SonnerToaster, toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ToasterProps {
  className?: string
}

const Toaster = ({ className }: ToasterProps) => {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: cn(
            'border border-border bg-background text-foreground shadow-lg',
            className
          ),
          title: 'text-foreground',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          success: 'border-primary/40',
          error: 'border-destructive',
          info: 'border-border',
          warning: 'border-amber-500',
          loading: 'border-border',
          closeButton: 'border-border bg-background text-foreground',
          default: 'border-border',
          content: 'text-foreground',
          icon: 'text-foreground',
          loader: 'text-muted-foreground',
        },
      }}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- this module intentionally exports the shared toast helper alongside the toaster component.
export { Toaster, toast }
