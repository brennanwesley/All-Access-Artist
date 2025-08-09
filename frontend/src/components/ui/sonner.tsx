/**
 * Toast Notification System
 * All Access Artist - Frontend v2.0.0
 * 
 * Global toast notification component using react-hot-toast
 * Configured to match application theme and shadcn/ui styling
 */
import { Toaster as HotToaster, toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ToasterProps {
  className?: string
}

const Toaster = ({ className }: ToasterProps) => {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName={cn('', className)}
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'calc(var(--radius) - 2px)',
          fontSize: '14px',
          padding: '12px 16px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        // Success toast styling
        success: {
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: 'hsl(var(--primary-foreground))',
          },
        },
        // Error toast styling
        error: {
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--destructive))',
          },
          iconTheme: {
            primary: 'hsl(var(--destructive))',
            secondary: 'hsl(var(--destructive-foreground))',
          },
        },
        // Loading toast styling
        loading: {
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          iconTheme: {
            primary: 'hsl(var(--muted-foreground))',
            secondary: 'hsl(var(--muted))',
          },
        },
      }}
    />
  )
}

export { Toaster, toast }
