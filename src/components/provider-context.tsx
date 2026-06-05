"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface ProviderData {
  id: string;
  name: string;
  email?: string | null;
  timezone: string;
  sessionDurationMins: number;
  currency: string;
  allowIndividualSelfBook: boolean;
  allowGroupSelfBook: boolean;
}

interface ProviderContextType {
  provider: ProviderData | null;
  providerId: string;
  loading: boolean;
  refetch: () => void;
}

const ProviderContext = createContext<ProviderContextType>({
  provider: null,
  providerId: "",
  loading: true,
  refetch: () => {},
});

export function ProviderProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchProvider() {
    try {
      const res = await fetch("/api/providers/me", { credentials: "include" });
      if (!res.ok) {
        // Auth failed or server error — redirect to sign-in if 401, setup otherwise
        if (res.status === 401) {
          router.push("/");
        } else {
          router.push("/setup");
        }
        return;
      }
      const data = await res.json();
      if (data.provider) {
        setProvider(data.provider);
      } else {
        router.push("/setup");
      }
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProvider();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ProviderContext.Provider
      value={{
        provider,
        providerId: provider?.id ?? "",
        loading,
        refetch: fetchProvider,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  return useContext(ProviderContext);
}
