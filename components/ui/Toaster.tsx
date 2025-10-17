import * as React from 'react';
import { Toast, ToastTitle, ToastDescription } from './Toast';
import { useToast } from './use-toast';
// Fix: Import the 'X' icon from 'lucide-react' to be used in the dismiss button.
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ul className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(function ({ id, title, description, action, variant }) {
        return (
          <Toast
            key={id}
            variant={variant}
            className="animate-slide-in-from-right"
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <button
              onClick={() => dismiss(id)}
              className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </Toast>
        );
      })}
    </ul>
  );
}
