"use client";

import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import SlotCylinder from "./SlotCylinder";
import Button from "./Button";
import Confetti from "react-confetti";

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
          clearcoat={1}
          clearcoatRoughness={0}
          depthWrite={false}
        />
      </mesh>

      {/* 3 cylinders positioned side by side */}
      <SlotCylinder
        position={[-1.5, -0.6, -2]}
        isSpinning={isSpinning}
        stopSegment={stopSegments[0]}
        onStop={onCylinderStop}
        segments={8}
        radius={1.5}
        height={1.8}
      />
      <SlotCylinder
        position={[-1.5, -0.6, 0]}
        isSpinning={isSpinning}
        stopSegment={stopSegments[1]}
        onStop={onCylinderStop}
        segments={8}
        radius={1.5}
        height={1.8}
      />
      <SlotCylinder
        position={[-1.5, -0.6, 2]}
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
            />
          )}
          {/* Spin button overlaid inside the canvas */}
          <div className="w-full h-full flex items-end justify-center pb-16 text-black">
            <Button
              onClick={onSpin}
              disabled={isSpinning}
              className="pointer-events-auto text-black"
            >
              {isSpinning ? "Spinning..." : "Spin"}
            </Button>
          </div>
        </div>
      </Html>
    </>
  );
};

export default SlotMachineScene;
