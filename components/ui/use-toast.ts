import * as React from 'react';

export type ToastActionElement = React.ReactElement;

export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive';
}

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 10000; // 10 seconds

type ToastState = {
  toasts: ToasterToast[];
};

let memoryState: ToastState = { toasts: [] };

const listeners: Array<(state: ToastState) => void> = [];

const setState = (newState: Partial<ToastState>) => {
  memoryState = { ...memoryState, ...newState };
  listeners.forEach((listener) => {
    listener(memoryState);
  });
};

export function toast(props: Omit<ToasterToast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);

  const newToast = { ...props, id };
  const updatedToasts = [newToast, ...memoryState.toasts].slice(0, TOAST_LIMIT);

  setState({
    toasts: updatedToasts,
  });

  setTimeout(() => {
    dismiss(id);
  }, TOAST_REMOVE_DELAY);
}

export function dismiss(id: string) {
  setState({
    toasts: memoryState.toasts.filter((t) => t.id !== id),
  });
}

export function useToast() {
  const [state, setStateReact] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    const listener = (newState: ToastState) => {
      setStateReact(newState);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss,
  };
}