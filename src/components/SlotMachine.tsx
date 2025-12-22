"use client";

import React, { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import SlotMachineScene from "./SlotMachineScene";
import { Lights } from "./Lights";
import Hall from "./Hall";
import { Preload } from "@react-three/drei";

interface SlotMachineProps {
  className?: string;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ className }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [stoppedCylinders, setStoppedCylinders] = useState(0);
  const [stopSegments, setStopSegments] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setStoppedCylinders(0);

    // Generate random stop segments for each cylinder
    // Similar to cherry-charm: random segments between min and max
    // For 8 segments, use 8-24 (1-3 full rotations) to ensure multiple spins
    const min = 8;
    const max = 24;
    const getRandomStopSegment = () =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const segments: [number, number, number] = [
      getRandomStopSegment(),
      getRandomStopSegment(),
      getRandomStopSegment(),
    ];
    setStopSegments(segments);
  }, [isSpinning]);

  const handleCylinderStop = useCallback(() => {
    setStoppedCylinders((prev) => {
      const newCount = prev + 1;
      if (newCount === 3) {
        // All cylinders have stopped
        setIsSpinning(false);
      }
      return newCount;
    });
  }, []);

  return (
    <div className={`flex flex-col items-center gap-4 ${className || ""}`}>
      <div className="w-full h-[100vh]">
        <Canvas
          gl={{ antialias: false, stencil: false }}
          camera={{ position: [5, 0, 0], fov: 80 }}
          className="bg-zinc-50"
        >
          <axesHelper args={[5]} />
          <ambientLight intensity={2} />
          <Lights />

          <Hall position={[0, 0.98, 0]} scale={3} />
          <SlotMachineScene
            isSpinning={isSpinning}
            stopSegments={stopSegments}
            onCylinderStop={handleCylinderStop}
            onSpin={handleSpin}
          />
          <Preload all />
        </Canvas>
      </div>
    </div>
  );
};

export default SlotMachine;
