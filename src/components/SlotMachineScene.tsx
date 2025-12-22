"use client";

import React from "react";
import SlotCylinder from "./SlotCylinder";

interface SlotMachineSceneProps {
  isSpinning: boolean;
  stopSegments: [number, number, number];
  onCylinderStop: () => void;
}

const SlotMachineScene: React.FC<SlotMachineSceneProps> = ({
  isSpinning,
  stopSegments,
  onCylinderStop,
}) => {
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
    </>
  );
};

export default SlotMachineScene;
