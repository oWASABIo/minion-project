export interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

export const useToast = () => {
  const toasts = useState<Toast[]>("toasts", () => []);

  const add = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    toasts.value.push(newToast);

    if (toast.duration !== 0) {
      setTimeout(() => {
        remove(id);
      }, toast.duration || 3000);
    }
  };

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (title: string, message?: string) => {
    add({ title, message, type: "success" });
  };

  const error = (title: string, message?: string) => {
    add({ title, message, type: "error" });
  };

  return {
    toasts,
    add,
    remove,
    success,
    error,
  };
};
