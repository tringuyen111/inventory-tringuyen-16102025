import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// Since we can't add @radix-ui/react-dialog as a dependency,
// we will create a basic modal implementation. This is a simplified version.

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

const Dialog: React.FC<{
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ children, open, onOpenChange }) => {
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<{ children: React.ReactElement; asChild?: boolean }> = ({ children, asChild }) => {
  const { onOpenChange } = React.useContext(DialogContext);
  const child = React.Children.only(children);

  if (asChild) {
      // FIX: Cast child to allow cloning with an onClick prop, and to access child.props.onClick.
      // The `children` prop is a generic ReactElement and TypeScript can't infer that it can accept an `onClick` prop.
      // Casting to `React.ReactElement<any>` tells TypeScript to allow any props, resolving the type errors.
      return React.cloneElement(child as React.ReactElement<any>, {
          onClick: () => {
              onOpenChange(true);
              // FIX: Cast `child.props` to `any` to access the `onClick` property.
              // The type of `child.props` is `unknown` by default, which prevents direct property access.
              if ((child.props as any).onClick) {
                  (child.props as any).onClick();
              }
          },
      });
  }

  return (
    <div onClick={() => onOpenChange(true)} style={{ display: 'inline-block' }}>
      {children}
    </div>
  );
};

const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  const { open, onOpenChange } = React.useContext(DialogContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      ></div>
      
      {/* Content */}
      <div
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
};

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => (
    <div
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter"

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    className,
    ...props
}) => (
    <h2
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
    />
);
DialogTitle.displayName = "DialogTitle"


export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
};