"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { defineChain } from "viem";
import { ReactNode } from "react";
import { metaMask } from "wagmi/connectors";
import { PermissionProvider } from "@/providers/PermissionProvider";
import { SessionAccountProvider } from "@/providers/SessionAccountProvider";

// Monad Testnet chain configuration
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet-explorer.monad.xyz",
    },
  },
  testnet: true,
});

export const connectors = [metaMask()];

const queryClient = new QueryClient();

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors,
  ssr: true,
  multiInjectedProviderDiscovery: false,
  transports: {
    [monadTestnet.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL || "https://testnet-rpc.monad.xyz"
    ),
  },
});

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <SessionAccountProvider>
          <PermissionProvider>{children}</PermissionProvider>
        </SessionAccountProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
