import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { instance as axios } from "@/shared/api/http";

type SessionGuardState = "checking" | "valid" | "invalid";

const shouldEndSession = (error: AxiosError) => {
  if (!error.response) {
    return true;
  }

  return [401, 403, 404].includes(error.response.status);
};

export function useSessionGuard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, logout, setUser } = useAuthStore();
  const [state, setState] = useState<SessionGuardState>(
    isAuthenticated ? "checking" : "invalid",
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setState("invalid");
      return;
    }

    if (!user?.id) {
      queryClient.clear();
      logout();
      navigate("/auth/login", { replace: true });
      setState("invalid");
      return;
    }

    let cancelled = false;

    const validateSession = async () => {
      setState("checking");

      try {
        const response = await axios.get(`/user/id/${user.id}`);
        const userData = response.data.data || response.data;

        if (!cancelled) {
          setUser(userData);
          setState("valid");
        }
      } catch (error) {
        const axiosError = error as AxiosError;

        if (!cancelled && shouldEndSession(axiosError)) {
          queryClient.clear();
          logout();
          navigate("/auth/login", { replace: true });
          setState("invalid");
          return;
        }

        if (!cancelled) {
          setState("valid");
        }
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id, logout, navigate, queryClient, setUser]);

  return state;
}
