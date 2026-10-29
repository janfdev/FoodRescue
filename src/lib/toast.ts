import toast, { ToastOptions } from "react-hot-toast";

const BASE_STYLE = {
  background: "#18181b",
  color: "#fafafa",
  fontSize: "13px",
  fontWeight: 600,
  borderRadius: "12px",
  padding: "10px 16px",
};

export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      ...options,
      style: {
        ...BASE_STYLE,
        border: "1px solid rgba(16, 185, 129, 0.4)", // Emerald green
        ...options?.style,
      },
      iconTheme: {
        primary: "#10b981", // Hijau cerah
        secondary: "#ffffff",
      },
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      ...options,
      style: {
        ...BASE_STYLE,
        border: "1px solid rgba(239, 68, 68, 0.4)", // Rose/Red
        ...options?.style,
      },
      iconTheme: {
        primary: "#ef4444", // Merah cerah
        secondary: "#ffffff",
      },
    }),

  loading: (message: string, options?: ToastOptions) =>
    toast.loading(message, {
      ...options,
      style: {
        ...BASE_STYLE,
        border: "1px solid rgba(245, 158, 11, 0.4)", // Amber/Orange
        ...options?.style,
      },
    }),

  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

export default showToast;
