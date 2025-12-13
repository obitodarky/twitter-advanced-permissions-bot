"use client";

import React from "react";
import SlotCylinder from "./SlotCylinder";

interface SlotMachineSceneProps {
  isSpinning: boolean;
  stopTimes: [number, number, number];
  onCylinderStop: () => void;
}

const SlotMachineScene: React.FC<SlotMachineSceneProps> = ({
  isSpinning,
  stopTimes,
  onCylinderStop,
}) => {
  return (
    <>
      {/* 3 cylinders positioned side by side */}
      <SlotCylinder
        position={[-2.5, 0, 0]}
        isSpinning={isSpinning}
        stopTime={stopTimes[0]}
        onStop={onCylinderStop}
        segments={8}
      />
      <SlotCylinder
        position={[0, 0, 0]}
        isSpinning={isSpinning}
        stopTime={stopTimes[1]}
        onStop={onCylinderStop}
        segments={8}
      />
      <SlotCylinder
        position={[2.5, 0, 0]}
        isSpinning={isSpinning}
        stopTime={stopTimes[2]}
        onStop={onCylinderStop}
        segments={8}
      />
    </>
  );
};

export default SlotMachineScene;
