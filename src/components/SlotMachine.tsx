"use client";

import React, { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import SlotMachineScene from "./SlotMachineScene";
import { Lights } from "./Lights";
import Hall from "./Hall";
import { Preload } from "@react-three/drei";
import VolumetricLight from "./VolumetricLight";
import AnimatedFog from "./AnimatedFog";

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
          <AnimatedFog
            color="#e0e0e0"
            minDensity={0.02}
            maxDensity={0.04}
            speed={0.2}
          />

          {/* 
            Volumetric lighting for god rays through the corridor
            Adjust these parameters to fine-tune the effect:
            
            POSITION & TARGET:
            - position: Light source location [x, y, z] - adjust y for height, z for depth
            - target: Where rays point [x, y, z] - typically at cylinder position
            
            LIGHT PROPERTIES:
            - intensity: Brightness (1-5 recommended)
            - color: Light color (hex string)
            - angle: Beam width in radians (0.2-0.8)
            - penumbra: Edge softness (0.3-1.0)
            
            RAY PROPERTIES:
            - rayLength: How far rays extend (8-20)
            - rayWidth: Thickness of rays (0.2-0.8)
            - rayCount: Number of visible rays (4-12)
            - rayOpacity: Transparency (0.3-0.8)
            - rayColor: Color of rays (hex string)
            
            ANIMATION:
            - animate: Enable/disable animation
            - animationSpeed: Speed multiplier (0.2-1.5)
            
            See VOLUMETRIC_LIGHTING_GUIDE.md for detailed instructions
          */}
          <VolumetricLight
            position={[0, 8, -5]}
            target={[0, -0.6, 0]}
            intensity={3}
            color="#ffffff"
            distance={25}
            decay={2}
            angle={0.4}
            penumbra={0.6}
            rayLength={12}
            rayWidth={0.4}
            rayCount={6}
            rayOpacity={0.5}
            rayColor="#ffffff"
            animate={true}
            animationSpeed={0.5}
          />

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
