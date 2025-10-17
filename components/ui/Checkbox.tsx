import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

type CheckboxProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        ref={ref}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <Check
          className={cn('h-4 w-4', checked ? 'opacity-100' : 'opacity-0')}
        />
      </button>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
