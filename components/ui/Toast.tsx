import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { type ToastActionElement, type ToastProps } from './use-toast';

const toastVariants = {
  base: 'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  variants: {
    variant: {
      default: 'border bg-background text-foreground',
      destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
    },
  },
};

const Toast = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement> & {
    variant?: 'default' | 'destructive';
    action?: ToastActionElement;
    onClose: () => void;
  }
>(({ className, variant = 'default', onClose, children, ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={cn(toastVariants.base, toastVariants.variants.variant[variant], className)}
      {...props}
    >
      {children}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
});

const ToastTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
));
ToastDescription.displayName = 'ToastDescription';

export { Toast, ToastTitle, ToastDescription };