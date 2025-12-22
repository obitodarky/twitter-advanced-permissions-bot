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
      {/* 3 cylinders positioned side by side */}
      <SlotCylinder
        position={[-1.5, -0.6, -2]}
        isSpinning={isSpinning}
        stopSegment={stopSegments[0]}
        onStop={onCylinderStop}
        segments={8}
      />
      <SlotCylinder
        position={[-1.5, -0.6, 0]}
        isSpinning={isSpinning}
        stopSegment={stopSegments[1]}
        onStop={onCylinderStop}
        segments={8}
      />
      <SlotCylinder
        position={[-1.5, -0.6, 2]}
        isSpinning={isSpinning}
        stopSegment={stopSegments[2]}
        onStop={onCylinderStop}
        segments={8}
      />
    </>
  );
};

export default SlotMachineScene;
