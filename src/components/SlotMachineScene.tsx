"use client";

import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import SlotCylinder from "./SlotCylinder";
import Button from "./Button";
import Confetti from "react-confetti";
import { loadTexturesFromUrls } from "@/utils/textureLoader";
import * as THREE from "three";
import {
  useAccount,
  useConnect,
  useChainId,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { metaMask } from "wagmi/connectors";
import { useSessionAccount } from "@/providers/SessionAccountProvider";
import { usePermissions } from "@/providers/PermissionProvider";
import { parseUnits } from "viem";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { MONAD_USDC_ADDRESS, USDC_DECIMALS } from "@/constants/tokens";
import { monadTestnet } from "@/providers/AppProvider";

interface SlotMachineSceneProps {
  isSpinning: boolean;
  stopSegments: [number, number, number];
  onCylinderStop: () => void;
  onSpin: () => void;
}

const SlotMachineScene: React.FC<SlotMachineSceneProps> = ({
  isSpinning,
  stopSegments,
  onCylinderStop,
  onSpin,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [wasSpinning, setWasSpinning] = useState(false);
  const [segmentTextures, setSegmentTextures] = useState<THREE.Texture[]>([]);
  const [spinCount, setSpinCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Wallet and account hooks
  const { connect } = useConnect();
  const { chainId: connectedChainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const currentChainId = useChainId();
  const { data: walletClient } = useWalletClient();

  // Session account and permissions
  const { sessionAccount, createSessionAccount } = useSessionAccount();
  const { permission, savePermission } = usePermissions();

  // Determine button state
  const getButtonState = () => {
    if (!isConnected) return "connect";
    if (connectedChainId !== currentChainId) return "switch-chain";
    if (!sessionAccount) return "create-session";
    if (!permission) return "grant-permissions";
    return "spin";
  };

  const buttonState = getButtonState();

  // Handle connect
  const handleConnect = () => {
    connect({ connector: metaMask() });
  };

  // Handle switch chain - add chain if not present, then switch
  const handleSwitchChain = async () => {
    try {
      await switchChain({ chainId: currentChainId });
    } catch (error: any) {
      // If chain is not added (error code 4902), add it first using wallet_addEthereumChain
      if (
        error?.code === 4902 ||
        error?.message?.includes("not added") ||
        error?.message?.includes("Unrecognized chain")
      ) {
        try {
          // Use the wallet provider directly to add the chain
          const provider = await (window as any).ethereum;
          if (provider) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${monadTestnet.id.toString(16)}`,
                  chainName: monadTestnet.name,
                  nativeCurrency: {
                    name: monadTestnet.nativeCurrency.name,
                    symbol: monadTestnet.nativeCurrency.symbol,
                    decimals: monadTestnet.nativeCurrency.decimals,
                  },
                  rpcUrls: monadTestnet.rpcUrls.default.http,
                  blockExplorerUrls: monadTestnet.blockExplorers?.default?.url
                    ? [monadTestnet.blockExplorers.default.url]
                    : undefined,
                },
              ],
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

  // Handle create session account
  const handleCreateSessionAccount = async () => {
    await createSessionAccount();
  };

  // Handle grant permissions
  const handleGrantPermissions = async () => {
    if (!sessionAccount || !walletClient) return;

    setIsLoading(true);
    try {
      const client = walletClient.extend(erc7715ProviderActions());
      const currentTime = Math.floor(Date.now() / 1000);
      const expiry = currentTime + 24 * 60 * 60 * 30; // 30 days

      const permissions = await client.requestExecutionPermissions([
        {
          chainId: currentChainId,
          expiry,
          signer: {
            type: "account",
            data: {
              address: sessionAccount.address,
            },
          },
          isAdjustmentAllowed: true,
          permission: {
            type: "erc20-token-periodic",
            data: {
              // USDC token address on Monad testnet
              tokenAddress: MONAD_USDC_ADDRESS,
              // 10 USDC (USDC has 6 decimals)
              periodAmount: parseUnits("10", USDC_DECIMALS),
              periodDuration: 86400, // 1 day in seconds
              justification: "Permission to transfer 10 USDC every day",
            },
          },
        },
      ]);
      savePermission(permissions[0]);
    } catch (error) {
      console.error("Error granting permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get button click handler based on state
  const getButtonClickHandler = () => {
    switch (buttonState) {
      case "connect":
        return handleConnect;
      case "switch-chain":
        return handleSwitchChain;
      case "create-session":
        return handleCreateSessionAccount;
      case "grant-permissions":
        return handleGrantPermissions;
      case "spin":
        return onSpin;
      default:
        return undefined;
    }
  };

  // Get button text based on state
  const getButtonText = () => {
    switch (buttonState) {
      case "connect":
        return "Connect with MetaMask";
      case "switch-chain":
        return "Switch to Monad Testnet";
      case "create-session":
        return "Create Session";
      case "grant-permissions":
        return isLoading ? "Granting Permissions..." : "Grant Permissions";
      case "spin":
        return `SPIN ${spinCount}`;
      default:
        return "";
    }
  };

  // Load segment images
  useEffect(() => {
    const imageUrls = [
      "/images/segment1.png",
      "/images/segment2.png",
      "/images/segment3.png",
      "/images/segment4.png",
      "/images/segment5.png",
      "/images/segment6.png",
      "/images/segment7.png",
      "/images/segment8.png",
    ];

    loadTexturesFromUrls(imageUrls)
      .then((textures) => {
        setSegmentTextures(textures);
      })
      .catch((error) => {
        console.error("Failed to load segment textures:", error);
      });
  }, []);

  // Track when spinning stops to show confetti
  useEffect(() => {
    if (isSpinning) {
      setWasSpinning(true);
      setShowConfetti(false);
    } else if (wasSpinning && !isSpinning) {
      // Spinning just stopped
      setShowConfetti(true);
      setWasSpinning(false);
      // Hide confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSpinning, wasSpinning]);

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Glass cover cylinder that encloses all 3 reels */}
      <mesh
        position={[-1.5, -0.6, 0]} // center between the three reels
        rotation={[Math.PI / 2, 0, 0]} // align with reel cylinders
      >
        {/* Slightly larger radius than the reels, long enough to cover all 3 */}
        <cylinderGeometry args={[1.7, 1.7, 6.2, 64, 1, true]} />
        {/* Glass-like material inspired by the CodeSandbox example:
            high transmission, low roughness, thin but noticeable thickness */}
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.25}
          roughness={0}
          metalness={0}
          transmission={1}
          thickness={0.4}
          envMapIntensity={1}
          clearcoat={0.2}
          clearcoatRoughness={0}
          depthWrite={false}
        />
      </mesh>

      {/* 3 cylinders positioned side by side */}
      <SlotCylinder
        position={[-1.5, -0.6, -1.85]}
        textures={segmentTextures}
        isSpinning={isSpinning}
        stopSegment={stopSegments[0]}
        onStop={onCylinderStop}
        segments={8}
        radius={1.5}
        height={1.8}
      />
      <SlotCylinder
        position={[-1.5, -0.6, 0]}
        textures={segmentTextures}
        isSpinning={isSpinning}
        stopSegment={stopSegments[1]}
        onStop={onCylinderStop}
        segments={8}
        radius={1.5}
        height={1.8}
      />
      <SlotCylinder
        position={[-1.5, -0.6, 1.85]}
        textures={segmentTextures}
        isSpinning={isSpinning}
        stopSegment={stopSegments[2]}
        onStop={onCylinderStop}
        segments={8}
        radius={1.5}
        height={1.8}
      />

      {/* Top navigation bar with gradient overlay */}
      <Html fullscreen>
        <div className="w-full h-full pointer-events-none">
          {/* Top nav bar with grey to transparent gradient */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-950 to-transparent flex items-center justify-center px-6 pointer-events-auto">
            <img
              src="/ape-spin-logo.svg"
              alt="APE SPIN Logo"
              className="h-12 w-auto translate-y-4 glow-animation"
            />
          </div>
          {showConfetti && (
            <Confetti
              width={windowSize.width || window.innerWidth}
              height={windowSize.height || window.innerHeight}
              colors={["#FFB60A", "#C7C7C7", "#000000", "#FFFFFF"]}
            />
          )}
          {/* State-aware button overlaid inside the canvas */}
          <div className="w-full h-full flex items-end justify-center pb-16">
            <div className="flex flex-col items-center gap-2 pointer-events-auto">
              {buttonState === "spin" ? (
                <Button
                  onClick={getButtonClickHandler()}
                  disabled={isSpinning}
                  spinCount={spinCount}
                  onSpinCountChange={setSpinCount}
                  className="pointer-events-auto"
                />
              ) : (
                <Button
                  onClick={getButtonClickHandler()}
                  disabled={isLoading || buttonState === "switch-chain"}
                  className="pointer-events-auto"
                  customText={getButtonText()}
                  showIcon={
                    buttonState === "create-session" ||
                    buttonState === "grant-permissions"
                  }
                  icon={
                    buttonState === "create-session" ? (
                      <ArrowRight className="w-5 h-5 text-[#2a2a2a]" />
                    ) : buttonState === "grant-permissions" ? (
                      isLoading ? (
                        <Loader2 className="w-5 h-5 text-[#2a2a2a] animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-[#2a2a2a]" />
                      )
                    ) : undefined
                  }
                />
              )}
              <p className="text-gray-400 text-sm font-sans">
                Max Permission 10 USDC/day
              </p>
            </div>
          </div>
        </div>
      </Html>
    </>
  );
};

export default SlotMachineScene;
