// hooks/useApi.ts
"use client";
import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useApi() {
  const request = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const token = localStorage.getItem("token");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      };

      const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      return data;
    },
    []
  );

  return { request };
}
