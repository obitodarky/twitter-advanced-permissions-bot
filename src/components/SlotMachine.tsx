"use client";

import React, { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import SlotMachineScene from "./SlotMachineScene";
import Button from "./Button";
import { Lights } from "./Lights";

interface SlotMachineProps {
  className?: string;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ className }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [stoppedCylinders, setStoppedCylinders] = useState(0);
  const [stopTimes, setStopTimes] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setStoppedCylinders(0);

    // Sequential stop times: left cylinder stops at 2s, middle at 3s, right at 4s
    const baseTime = 2; // Base time in seconds
    const intervals = [baseTime, baseTime + 1, baseTime + 2];
    setStopTimes(intervals as [number, number, number]);
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
      <div className="w-full h-96">
        <Canvas
          camera={{ position: [0, 3, 6], fov: 50 }}
          className="bg-zinc-50"
        >
          <Lights />

          {/* Slot Machine 3D Scene */}
          <SlotMachineScene
            isSpinning={isSpinning}
            stopTimes={stopTimes}
            onCylinderStop={handleCylinderStop}
          />
        </Canvas>
      </div>

      {/* Spin Button */}
      <Button onClick={handleSpin} disabled={isSpinning} className="mt-4">
        {isSpinning ? "Spinning..." : "Spin"}
      </Button>
    </div>
  );
};

export default SlotMachine;
