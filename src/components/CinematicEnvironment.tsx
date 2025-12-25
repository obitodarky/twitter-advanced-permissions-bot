"use client";

import React, { useMemo } from "react";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface CinematicEnvironmentProps {
  hallScene?: THREE.Object3D;
}

const CinematicEnvironment: React.FC<CinematicEnvironmentProps> = ({ hallScene }) => {
  // Enhanced environment with better reflections and lighting
  // Using sunset preset for warm cinematic lighting, or warehouse for indoor
  return (
    <Environment
      preset="sunset" // Warm, cinematic lighting - great for dramatic scenes
      background={false} // Don't replace the background, just use for reflections
      environmentIntensity={1.8} // Increased for stronger reflections
      environmentRotation={[0, 0, 0]} // Rotate environment map if needed
      // Alternative presets: "sunset", "dawn", "night", "warehouse", "forest", "apartment", "studio", "city"
    />
  );
};

export default CinematicEnvironment;

