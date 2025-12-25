"use client";

import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface AnimatedFogProps {
  color?: string;
  minDensity?: number;
  maxDensity?: number;
  speed?: number;
}

const AnimatedFog: React.FC<AnimatedFogProps> = ({
  color = "#e0e0e0",
  minDensity = 0.01,
  maxDensity = 0.08,
  speed = 1,
}) => {
  const { scene } = useThree();
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    timeRef.current += delta * speed;
    
    // Create a smooth flickering effect using sine wave
    // Maps sine wave (-1 to 1) to density range (minDensity to maxDensity)
    const density = 
      minDensity + 
      (maxDensity - minDensity) * 
      (Math.sin(timeRef.current * 2) * 0.5 + 0.5);
    
    // Update fog density if fog exists
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = density;
    }
  });

  return (
    <fogExp2 attach="fog" args={[color, minDensity]} />
  );
};

export default AnimatedFog;

