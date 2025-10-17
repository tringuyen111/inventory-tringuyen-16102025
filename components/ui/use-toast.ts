import * as React from 'react';

export type ToastActionElement = React.ReactElement;

type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 10000;

type ToastState = {
  toasts: ToastProps[];
};

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function setState(newState: Partial<ToastState>) {
  memoryState = { ...memoryState, ...newState };
  for (const listener of listeners) {
    listener(memoryState);
  }
}

export function toast(props: Omit<ToastProps, 'id'>) {
  const id = Math.random().toString(36).substring(2, 11);

  const newToast = { id, ...props };
  const updatedToasts = [newToast, ...memoryState.toasts].slice(0, TOAST_LIMIT);

  setState({
    toasts: updatedToasts,
  });

  setTimeout(() => {
    dismiss(id);
  }, TOAST_REMOVE_DELAY);

  return { id };
}

export function dismiss(id: string) {
  setState({
    toasts: memoryState.toasts.filter((t) => t.id !== id),
  });
}

export function useToast() {
  const [state, setStateReact] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setStateReact);
    return () => {
      const index = listeners.indexOf(setStateReact);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss,
  };
}
