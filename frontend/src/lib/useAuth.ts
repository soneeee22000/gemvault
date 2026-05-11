"use client";

import { useCallback, useEffect, useState } from "react";

import { clearToken, getStoredToken, storeToken } from "./api";

export type AuthState = {
  token: string | null;
  isReady: boolean;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    isReady: false,
  });

  useEffect(() => {
    setState({ token: getStoredToken(), isReady: true });
  }, []);

  const setToken = useCallback((token: string) => {
    storeToken(token);
    setState({ token, isReady: true });
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setState({ token: null, isReady: true });
  }, []);

  return { ...state, setToken, signOut };
}
