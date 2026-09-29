"use client";

import { createContext, useContext } from "react";

const AiContext = createContext<boolean>(false);

export function AiProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return <AiContext.Provider value={enabled}>{children}</AiContext.Provider>;
}

export function useAiEnabled(): boolean {
  return useContext(AiContext);
}
