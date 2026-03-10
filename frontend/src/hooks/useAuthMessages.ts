import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import { toast } from "sonner";

export function useAuthMessages() {
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.message) {
        toast.success(state.message, { position: "top-center" });
        useAuthStore.getState().clearMessages();
      }

      if (state.error) {
        toast.error(state.error, { position: "top-center" });
        useAuthStore.getState().clearMessages();
      }
    });
    return () => unsubscribe();
  }, []);
}
