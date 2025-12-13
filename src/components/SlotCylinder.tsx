"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SlotCylinderProps {
  position: [number, number, number];
  textures?: THREE.Texture[];
  isSpinning: boolean;
  stopTime: number; // Time in seconds when this cylinder should stop
  onStop: () => void;
  segments?: number; // Number of segments/images around the cylinder
}

const SlotCylinder: React.FC<SlotCylinderProps> = ({
  position,
  textures,
  isSpinning,
  stopTime,
  onStop,
  segments = 12,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationSpeedRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const [hasStopped, setHasStopped] = useState(false);

  // Reset when spinning starts
  useEffect(() => {
    if (isSpinning) {
      startTimeRef.current = Date.now();
      rotationSpeedRef.current = 0.2; // Initial rotation speed
      setHasStopped(false);
    }
  }, [isSpinning]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isSpinning && !hasStopped && startTimeRef.current !== null) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds

      if (elapsed < stopTime) {
        // Accelerate then decelerate
        const progress = elapsed / stopTime;

        // Smooth deceleration curve (ease-out)
        const decelerationFactor = 1 - Math.pow(progress, 2);
        rotationSpeedRef.current = 0.2 * decelerationFactor;

        // Ensure minimum speed for smooth animation
        if (rotationSpeedRef.current < 0.01) {
          rotationSpeedRef.current = 0.01;
        }
      } else {
        // Stop the cylinder
        rotationSpeedRef.current = 0;
        setHasStopped(true);
        onStop();
      }

      // Rotate around X axis (horizontal cylinder's long axis) using delta for frame-rate independent animation
      meshRef.current.rotation.x += rotationSpeedRef.current * delta * 10;
    }
  });

  // Create a canvas texture with colored segments as fallback
  const createSegmentTexture = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];

    const segmentWidth = canvas.width / segments;

    for (let i = 0; i < segments; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(i * segmentWidth, 0, segmentWidth, canvas.height);

      // Add border between segments
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(i * segmentWidth, 0);
      ctx.lineTo(i * segmentWidth, canvas.height);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    return texture;
  }, [segments]);

  // Use provided textures or fallback to canvas texture
  const material = React.useMemo(() => {
    if (textures && textures.length > 0) {
      const texture = textures[0];
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      return new THREE.MeshStandardMaterial({ map: texture });
    } else if (createSegmentTexture) {
      return new THREE.MeshStandardMaterial({ map: createSegmentTexture });
    } else {
      return new THREE.MeshStandardMaterial({ color: "#FF6B6B" });
    }
  }, [textures, createSegmentTexture]);

  // Create geometry with proper UV mapping
  const geometry = React.useMemo(() => {
    return new THREE.CylinderGeometry(1, 1, 2, segments, 1, true);
  }, [segments]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      material={material}
      rotation={[0, 0, Math.PI / 2]} // Rotate 90 degrees around Z axis to make cylinder horizontal
    />
  );
};

export default SlotCylinder;
