import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValue: string | null;
  setSelectedValue: (value: string | null) => void;
  displayValue: React.ReactNode;
  setDisplayValue: (node: React.ReactNode) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelect must be used within a SelectProvider');
  }
  return context;
};

const Select = ({ children, value, onValueChange }: { children: React.ReactNode; value?: string; onValueChange?: (value: string) => void; }) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(value ?? null);
  const [displayValue, setDisplayValue] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);
  
  const handleValueChange = (newValue: string | null) => {
    if(newValue === null) return;
    setSelectedValue(newValue);
    if(onValueChange) {
        onValueChange(newValue);
    }
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, setSelectedValue: handleValueChange, displayValue, setDisplayValue }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, displayValue } = useSelect();
    return (
      <button
        type="button"
        ref={ref}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {displayValue || children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, setOpen]);


    if (!open) return null;

    return (
      <div
        ref={contentRef}
        className={cn(
          'absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-content-show',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = 'SelectContent';

// FIX: Add `disabled` prop to SelectItem to allow disabling options.
// This resolves type errors in Warehouses.tsx and Branches.tsx where a disabled loading option is used.
const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const { setOpen, setSelectedValue, selectedValue, setDisplayValue } = useSelect();
    
    useEffect(() => {
        if(selectedValue === value) {
            setDisplayValue(children);
        }
    }, [selectedValue, value, children, setDisplayValue]);

    return (
      <div
        ref={ref}
        onClick={() => {
          if (disabled) return;
          setSelectedValue(value);
          setDisplayValue(children);
          setOpen(false);
        }}
        className={cn(
          'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          selectedValue === value && 'font-bold',
          className
        )}
        data-disabled={disabled ? true : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

// FIX: Update SelectValue to accept a `placeholder` prop to fix type error and allow showing placeholder text.
const SelectValue = ({ placeholder }: { placeholder?: React.ReactNode }) => {
  const { displayValue } = useSelect();
  return <>{displayValue ?? placeholder}</>;
};
SelectValue.displayName = 'SelectValue';


export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };