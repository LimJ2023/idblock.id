import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast";

import { useToast } from "@/hooks/use-toast";

import { CircleAlert, CircleCheck } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="up">
      {toasts.map(function ({ id, description, action, variant, ...props }) {
        return (
          <Toast
            variant={variant}
            className="rounded-full py-4 font-pretendard"
            key={id}
            {...props}
          >
            <div className="flex items-center justify-center">
              {description && (
                <span className="inline-flex items-center gap-2">
                  {variant === "default" ? (
                    <CircleCheck className="fill-toast-text stroke-toast-background h-6 w-6" />
                  ) : (
                    <CircleAlert className="h-6 w-6 fill-red-200 stroke-red-600" />
                  )}
                  <ToastDescription className="font-bold">
                    {description}
                  </ToastDescription>
                </span>
              )}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
