"use client";

import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import SlotCylinder from "./SlotCylinder";
import Button from "./Button";
import Confetti from "react-confetti";
import { loadTexturesFromUrls } from "@/utils/textureLoader";
import * as THREE from "three";

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
          {/* Spin button overlaid inside the canvas */}
          <div className="w-full h-full flex items-end justify-center pb-16">
            <div className="flex flex-col items-center gap-2 pointer-events-auto">
              <Button
                onClick={onSpin}
                disabled={isSpinning}
                spinCount={spinCount}
                onSpinCountChange={setSpinCount}
                className="pointer-events-auto"
              />
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
