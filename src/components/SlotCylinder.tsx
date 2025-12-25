"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SlotCylinderProps {
  position: [number, number, number];
  textures?: THREE.Texture[];
  isSpinning: boolean;
  stopSegment?: number; // Target segment to stop at (undefined means not set yet)
  onStop: () => void;
  segments?: number; // Number of segments/images around the cylinder
  radius?: number;
  height?: number;
}

interface CylinderGroup extends THREE.Mesh {
  reelSegment?: number;
  reelSpinUntil?: number;
  targetRotationY?: number;
  isSnapping?: boolean;
}

const SlotCylinder: React.FC<SlotCylinderProps> = ({
  position,
  textures,
  isSpinning,
  stopSegment,
  onStop,
  segments = 8,
  radius,
  height,
}) => {
  const meshRef = useRef<CylinderGroup>(null);

  // Calculate the rotation per segment (WHEEL_SEGMENT equivalent)
  // For a cylinder, each segment is 2π / segments radians
  const WHEEL_SEGMENT = (2 * Math.PI) / segments;

  // Reset when spinning starts
  useEffect(() => {
    if (isSpinning && meshRef.current) {
      // Reset rotation and state
      meshRef.current.rotation.y = 0;
      meshRef.current.reelSegment = 0;
      meshRef.current.isSnapping = false;

      // Set target segment if provided
      if (stopSegment !== undefined) {
        meshRef.current.reelSpinUntil = stopSegment;
        meshRef.current.targetRotationY = stopSegment * WHEEL_SEGMENT;
      }
    }
  }, [isSpinning, stopSegment, WHEEL_SEGMENT]);

  useFrame(() => {
    const reel = meshRef.current;
    if (!reel || !isSpinning) return;

    // Only animate if we have a target set
    if (reel.reelSpinUntil === undefined || reel.targetRotationY === undefined)
      return;

    const rotationSpeed = 0.1;

    if (!reel.isSnapping) {
      // Continuous spinning phase - rotate until we're close to target
      if (reel.rotation.y < reel.targetRotationY - rotationSpeed) {
        reel.rotation.y += rotationSpeed;
        reel.reelSegment = Math.floor(reel.rotation.y / WHEEL_SEGMENT);
      } else {
        // Switch to snapping phase
        reel.isSnapping = true;
      }
    }
    if (reel.isSnapping) {
      // Snapping phase - smoothly lerp to exact target position
      reel.rotation.y = THREE.MathUtils.lerp(
        reel.rotation.y,
        reel.targetRotationY,
        0.2
      );

      // Check if we've reached the target
      if (Math.abs(reel.rotation.y - reel.targetRotationY) < 0.01) {
        reel.rotation.y = reel.targetRotationY;
        reel.reelSegment = reel.reelSpinUntil;

        // Clear spinning state
        reel.reelSpinUntil = undefined;
        reel.isSnapping = false;
        reel.targetRotationY = undefined;

        // Notify parent that this cylinder has stopped
        onStop();
      }
    }
  });
  // Create texture atlas from textures array if provided
  const textureAtlas = React.useMemo(() => {
    if (textures && textures.length > 0) {
      // Create a canvas to combine all textures into an atlas
      const canvas = document.createElement("canvas");
      // Use a reasonable default size, or try to get from first texture
      let originalWidth = 256;
      let originalHeight = 256;

      // Try to get dimensions from first texture if available
      const firstImage = textures[0].image;
      if (
        firstImage &&
        (firstImage instanceof HTMLImageElement ||
          firstImage instanceof HTMLCanvasElement)
      ) {
        originalWidth = firstImage.width || 256;
        originalHeight = firstImage.height || 256;
      }

      // After rotating 90 degrees, width and height swap
      const segmentWidth = originalHeight; // rotated width
      const segmentHeight = originalWidth; // rotated height

      canvas.width = segmentWidth * textures.length;
      canvas.height = segmentHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      // Draw each texture to canvas, rotated 90 degrees clockwise
      textures.forEach((texture, index) => {
        const img = texture.image;
        if (
          img &&
          (img instanceof HTMLImageElement ||
            img instanceof HTMLCanvasElement ||
            img instanceof ImageBitmap)
        ) {
          const x = index * segmentWidth;
          const y = 0;

          // Save context, rotate, draw, then restore
          ctx.save();
          // Translate to the center of where we want to draw
          ctx.translate(x + segmentWidth / 2, segmentHeight / 2);
          // Rotate 90 degrees clockwise (Math.PI / 2)
          ctx.rotate(Math.PI / 2);
          // Draw the image centered at origin (after translation and rotation)
          ctx.drawImage(
            img,
            -originalWidth / 2,
            -originalHeight / 2,
            originalWidth,
            originalHeight
          );
          ctx.restore();
        }
      });

      const atlas = new THREE.CanvasTexture(canvas);
      atlas.wrapS = THREE.ClampToEdgeWrapping;
      atlas.wrapT = THREE.ClampToEdgeWrapping;
      atlas.needsUpdate = true;
      return atlas;
    }
    return null;
  }, [textures]);

  // Create a canvas texture with colored segments as fallback
  const createSegmentTexture = React.useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const colors = ["#111111 ", "#111111 ", "#111111 ", "#111111 "];

    const segmentWidth = canvas.width / segments;

    for (let i = 0; i < segments; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(i * segmentWidth, 0, segmentWidth, canvas.height);

      // Add border between segments
      // ctx.strokeStyle = "#000";
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
  // Enhanced material for better light reflection
  const material = React.useMemo(() => {
    const baseMaterialProps = {
      roughness: 1.2, // Lower roughness for more reflection
      metalness: 0.1, // Slight metalness for better light interaction
      envMapIntensity: 1.5, // Enhanced environment map for reflections
    };

    if (textureAtlas) {
      return new THREE.MeshStandardMaterial({
        map: textureAtlas,
        ...baseMaterialProps,
      });
    } else if (createSegmentTexture) {
      return new THREE.MeshStandardMaterial({
        map: createSegmentTexture,
        ...baseMaterialProps,
      });
    } else {
      return new THREE.MeshStandardMaterial({
        color: "#0B0B11 ",
        ...baseMaterialProps,
      });
    }
  }, [textureAtlas, createSegmentTexture]);

  // Create geometry with enough radial segments to appear smooth,
  // while still using `segments` for the logical reel divisions.
  const geometry = React.useMemo(() => {
    const radialSegments = segments * 8; // increase this multiplier for even smoother edges
    // Ensure radius is always 2x the height.
    // Use the provided `height` if given, otherwise fall back to 1.
    const h = height ?? 1;
    const r = radius ?? 2 * h;
    const geo = new THREE.CylinderGeometry(r, r, h, radialSegments, 1, true);
    geo.computeVertexNormals();
    return geo;
  }, [segments, radius, height]);

  // Update texture repeat when using atlas
  React.useEffect(() => {
    if (
      textureAtlas &&
      material instanceof THREE.MeshStandardMaterial &&
      material.map
    ) {
      // Set repeat to 1 so the full atlas wraps around the cylinder
      // The atlas contains all segments side by side, so one full rotation shows all segments
      material.map.repeat.set(1, 1);
      material.map.offset.set(0, 0);
      material.needsUpdate = true;
    }
  }, [textureAtlas, segments, material]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      material={material}
      rotation={[Math.PI / 2, 0, 0]} // Rotate 90 degrees around Z axis to make cylinder horizontal
    />
  );
};

export default SlotCylinder;
