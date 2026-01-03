"use client";

import { useAccount, useChainId, useConnect, useSwitchChain } from "wagmi";
import Button from "@/components/Button";
import { metaMask } from "wagmi/connectors";
import { monadTestnet } from "@/providers/AppProvider";

export default function ConnectButton() {
  const { connect } = useConnect();
  const { chainId: connectedChainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();

  const handleSwitchChain = async () => {
    try {
      await switchChain({ chainId: currentChainId });
    } catch (error: any) {
      // If chain is not added (error code 4902), add it first using wallet_addEthereumChain
      if (error?.code === 4902 || error?.message?.includes("not added") || error?.message?.includes("Unrecognized chain")) {
        try {
          // Use the wallet provider directly to add the chain
          const provider = await (window as any).ethereum;
          if (provider) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${monadTestnet.id.toString(16)}`,
                chainName: monadTestnet.name,
                nativeCurrency: {
                  name: monadTestnet.nativeCurrency.name,
                  symbol: monadTestnet.nativeCurrency.symbol,
                  decimals: monadTestnet.nativeCurrency.decimals,
                },
                rpcUrls: monadTestnet.rpcUrls.default.http,
                blockExplorerUrls: monadTestnet.blockExplorers?.default?.url ? [monadTestnet.blockExplorers.default.url] : undefined,
              }],
            });
            // After adding, try switching again
            await switchChain({ chainId: currentChainId });
          }
        } catch (addError) {
          console.error("Error adding chain:", addError);
        }
      } else {
        console.error("Error switching chain:", error);
      }
    }
  };

  if (isConnected && connectedChainId !== currentChainId) {
    return (
      <Button
        className="w-full space-x-2"
        onClick={handleSwitchChain}
      >
        <span>Switch to Monad Testnet</span>
      </Button>
    );
  }

  return (
    <Button
      className="w-full space-x-2"
      onClick={() => connect({ connector: metaMask() })}
    >
      <span>Connect with MetaMask</span>
    </Button>
  );
}
