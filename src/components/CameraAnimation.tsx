"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

interface CameraAnimationProps {
  startPosition?: [number, number, number];
  endPosition?: [number, number, number];
  duration?: number; // in seconds
}

const CameraAnimation: React.FC<CameraAnimationProps> = ({
  startPosition = [10, 0, 0],
  endPosition = [5, 0, 0],
  duration = 2,
}) => {
  const { camera } = useThree();
  const startTime = useRef<number | null>(null);
  const isAnimating = useRef(true);

  useEffect(() => {
    // Set initial camera position
    camera.position.set(...startPosition);
    startTime.current = null;
    isAnimating.current = true;
  }, []);

  useFrame((state, delta) => {
    if (!isAnimating.current) return;

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTime.current;
    const progress = Math.min(elapsed / duration, 1);

    // Use easing function for smooth animation (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Interpolate camera position
    const currentX = THREE.MathUtils.lerp(
      startPosition[0],
      endPosition[0],
      easedProgress
    );
    const currentY = THREE.MathUtils.lerp(
      startPosition[1],
      endPosition[1],
      easedProgress
    );
    const currentZ = THREE.MathUtils.lerp(
      startPosition[2],
      endPosition[2],
      easedProgress
    );

    camera.position.set(currentX, currentY, currentZ);

    // Stop animation when complete
    if (progress >= 1) {
      isAnimating.current = false;
      camera.position.set(...endPosition);
    }
  });

  return null;
};

export default CameraAnimation;



